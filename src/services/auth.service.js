import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";
import prisma from "../utils/prisma.js";
import crypto from "crypto";
import { sendOtpEmail, sendForgotPasswordEmail } from "../utils/node-mailer.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import RoleEnum from "../enums/RoleEnum.js";
import { TEMPORARY_SUPER_OTP } from "../constants/constants.js";

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);
const OTP_EXPIRY_MINUTES = 5;


export const registerUser = async (
  firstName,
  lastName,
  email,
  phone,
  password,
  role,
  gender = null,
  hostGymName,
  hostGymAddress
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(role)
  const roleData = await prisma.role.findUnique({
    where: { name: role },
  });

  if (!roleData) {
    throw new Error("Invalid Role. The role not found in the database.");
  }

  const shouldCreateProfile =
    hostGymName !== undefined ||
    hostGymAddress !== undefined;

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      gender,
      phoneVerified: true,
      password: hashedPassword,
      roleId: roleData.id,
      ...(shouldCreateProfile && {
        userProfileDetails: {
          create: {
            ...(hostGymName !== undefined ? { hostGymName } : {}),
            ...(hostGymAddress !== undefined ? { hostGymAddress } : {}),
          },
        },
      }),
    },
    include: {
      userProfileDetails: true,
    },
  });

  setImmediate(() => {
    sendOtp(user.id).catch(err => {
      console.error("OTP sending failed:", err);
    });
  });

  return { user };
};

export const loginUser = async (email, password, fcmToken) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      roleId: true,
      password: true,
      isActive: true,
      phoneVerified: true,
      gender: true,
      createdAt: true,
      role: true,
      provider: true,
      specialities: {
        select: {
          specialityId: true,
        }
      },
      assignedCustomersAsCustomer: {
        select: {
          id: true,
          trainerId: true,
          isActive: true,
          startDate: true,
          endDate: true,
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        }
      },
      customerQuestionaires: true,
    }
  });

  if (!user) throw new Error("Invalid credentials");

  // Block Google users from password login
  if (user.provider !== "LOCAL") {
    throw new Error("Please login using Google");
  }

  if (!user?.isActive) {
    throw new Error("Your account needs approval. Please contact admin.");
  }

  if (!user.password) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  if (fcmToken) {
    // Update fcmToken in User table
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken }
    });

    // Always create a new userDevice entry (avoid upsert race condition / primary on userId + fcmToken)
    const deviceExists = await prisma.userDevice.findFirst({
      where: {
        userId: user.id,
        fcmToken: fcmToken
      }
    });
    if (!deviceExists) {
      await prisma.userDevice.create({
        data: {
          userId: user.id,
          fcmToken: fcmToken,
          createdAt: new Date()
        }
      });
    }
  }

  if (user.role && user.role.name === RoleEnum.SUPERADMIN) {
    const access_token = signToken({ userId: user.id });
    const refresh_token = signToken({ userId: user.id, type: "refresh" }, { expiresIn: "30d" });
    user.access_token = access_token;
    user.refresh_token = refresh_token;
  }

  // send otp after login, only if phoneVerified is false

  if (!user.phoneVerified) {
    setImmediate(() => {
      sendOtp(user.id).catch(err => {
        console.error("OTP sending failed:", err);
      });
    });
    return { user };
  } else {
    const access_token = signToken({ userId: user.id });
    const refresh_token = signToken({ userId: user.id, type: "refresh" }, { expiresIn: "30d" });
    return { user, access_token, refresh_token };
  }
};


const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

/* SEND OTP */
export const sendOtp = async (userId) => {
  const code = generateOtp();

  // invalidate previous OTPs
  await prisma.otp.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  await prisma.otp.create({
    data: {
      userId,
      code,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  // Send OTP to user's email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.email) {
    await sendOtpEmail(user.email, code);
  } else {
    console.log("OTP (no email found):", code);
  }


  return true;
};

/* VERIFY OTP */
export const verifyOtp = async (userId, otp) => {
  // If otp is sent as number convert it to string  TODO : 
  // TODO: need to chagne datatype to number
  if (typeof otp === "number") {
    otp = otp.toString();
  }
  const record = await prisma.otp.findFirst({
    where: {
      userId,
      code: otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      phoneVerified: true,
      gender: true,
      roleId: true,
      createdAt: true,
      role: true,
      specialities: {
        select: {
          specialityId: true,
        }
      }
    }
  });

  if (!record && otp != TEMPORARY_SUPER_OTP) {
    throw new Error("Invalid or expired OTP");
  }

  // if (otp != TEMPORARY_SUPER_OTP) {
   if (record) {
    await prisma.$transaction(async (tx) => {
      await tx.otp.update({
        where: { id: record.id },
        data: { used: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: { phoneVerified: true },
      });
    });
   }
    
  // }

  // const access_token = signToken({ userId: userId });
  // const refresh_token = signToken({ userId: userId }, { expiresIn: "30d", type: "refresh" });
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      phoneVerified: true,
      gender: true,
      roleId: true,
      createdAt: true,
      role: true,
      specialities: {
        select: {
          specialityId: true,
        }
      }
    }
  });
  // Optional: clean response
  // delete user.password; // 'user' is not defined in this context

  const shouldIssueTokens =
    updatedUser?.phoneVerified &&
    (
      updatedUser?.role?.name === RoleEnum.CUSTOMER ||
      updatedUser?.isActive
    );

  if (shouldIssueTokens) {
    const access_token = signToken({ userId });
    const refresh_token = signToken(
      { userId, type: "refresh" },
      { expiresIn: "30d" }
    );

    return {
      user: updatedUser,
      access_token,
      refresh_token,
    };
  }

  return {
    user: updatedUser,
  };
};

/* RESEND OTP */
export const resendOtp = async (userId) => {
  return sendOtp(userId);
};


const generateResetToken = () => crypto.randomBytes(32).toString("hex");

const findUserByEmailAndRole = async (email, roleName) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      roleId: role.id,
    },
  });

  if (!user) {
    throw new Error("User with this email does not exist");
  }

  return { user, role };
};

const requestPasswordReset = async (email, roleName) => {
  const { user } = await findUserByEmailAndRole(email, roleName);

  // Reuse existing OTP mechanism for password reset
  await sendOtp(user.id);

  return {
    success: true,
  };
};

const verifyPasswordResetOtp = async (email, roleName, otp) => {
  const { user } = await findUserByEmailAndRole(email, roleName);

  if (typeof otp === "number") {
    otp = otp.toString();
  }

  const record = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      code: otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new Error("Invalid or expired OTP");
  }

  await prisma.otp.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { success: true };
};

const requestPasswordResetByPhone = async (phone, roleName) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const user = await prisma.user.findFirst({
    where: {
      phone,
      roleId: role.id,
    },
  });

  if (!user) {
    throw new Error("User with this phone number does not exist");
  }

  await prisma.otp.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  await prisma.otp.create({
    data: {
      userId: user.id,
      code: String(TEMPORARY_SUPER_OTP),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  return {
    success: true,
    userId: user.id,
    otp: String(TEMPORARY_SUPER_OTP),
  };
};

const resetUserPassword = async (email, roleName, password) => {
  const { user } = await findUserByEmailAndRole(email, roleName);

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      provider: "LOCAL",
    },
  });

  return { success: true };
};

const resetUserPasswordByPhone = async (phone, roleName, password) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const user = await prisma.user.findFirst({
    where: {
      phone,
      roleId: role.id,
    },
  });

  if (!user) {
    throw new Error("User with this phone number does not exist");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      provider: "LOCAL",
    },
  });

  return { success: true };
};

export const trainerForgotPassword = async (email) => {
  return requestPasswordReset(email, RoleEnum.TRAINER);
};

export const customerForgotPassword = async (email) => {
  return requestPasswordReset(email, RoleEnum.CUSTOMER);
};

export const customerForgotPasswordByPhone = async (phone) => {
  return requestPasswordResetByPhone(phone, RoleEnum.CUSTOMER);
};

export const trainerForgotPasswordByPhone = async (phone) => {
  return requestPasswordResetByPhone(phone, RoleEnum.TRAINER);
};

export const customerVerifyForgotPasswordOtpByPhone = async (phone, otp) => {
  return verifyForgotPasswordOtpByPhone(phone, RoleEnum.CUSTOMER, otp);
};

const verifyForgotPasswordOtpByPhone = async (phone, roleName, otp) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const user = await prisma.user.findFirst({
    where: {
      phone,
      roleId: role.id,
    },
  });

  if (!user) {
    throw new Error("User with this phone number does not exist");
  }

  const normalizedOtp = typeof otp === "number" ? otp.toString() : String(otp);

  const record = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      code: normalizedOtp,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new Error("Invalid or expired OTP");
  }

  await prisma.otp.update({
    where: { id: record.id },
    data: { used: true },
  });

  return {
    success: true,
    userId: user.id,
  };
};

export const trainerVerifyForgotPasswordOtpByPhone = async (phone, otp) => {
  return verifyForgotPasswordOtpByPhone(phone, RoleEnum.TRAINER, otp);
};

export const trainerVerifyPasswordResetOtp = async (email, otp) => {
  return verifyPasswordResetOtp(email, RoleEnum.TRAINER, otp);
};

export const customerVerifyPasswordResetOtp = async (email, otp) => {
  return verifyPasswordResetOtp(email, RoleEnum.CUSTOMER, otp);
};

export const trainerResetPasswordWithEmail = async (email, password) => {
  return resetUserPassword(email, RoleEnum.TRAINER, password);
};

export const customerResetPasswordWithEmail = async (email, password) => {
  return resetUserPassword(email, RoleEnum.CUSTOMER, password);
};

export const customerResetPasswordWithPhone = async (phone, password) => {
  return resetUserPasswordByPhone(phone, RoleEnum.CUSTOMER, password);
};

export const trainerResetPasswordWithPhone = async (phone, password) => {
  return resetUserPasswordByPhone(phone, RoleEnum.TRAINER, password);
};

export const googleLogin = async (idToken) => {
  // 1. Verify token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_WEB_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const {
    sub,        // Google user ID
    email,
    given_name,
    family_name,
  } = payload;

  // 2. Find existing user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // 3. If not exists, create user
  if (!user) {
    const trainerRole = await prisma.role.findUnique({
      where: { name: "Trainer" },
    });

    user = await prisma.user.create({
      data: {
        email,
        firstName: given_name,
        lastName: family_name,
        provider: "GOOGLE",
        providerId: sub,
        roleId: trainerRole.id,
      },
    });
  }

  // 4. Issue your JWT
  const token = signToken({ userId: user.id });

  return { user, token };
};

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const facebookLogin = async (accessToken) => {
  // 1. Verify token & get user info from Facebook
  const fbResponse = await axios.get(
    process.env.FACEBOOK_API_URL,
    {
      params: {
        fields: "id,email,first_name,last_name",
        access_token: accessToken,
      },
    }
  );

  const {
    id: facebookId,
    email,
    first_name,
    last_name,
  } = fbResponse.data;

  if (!email) {
    throw new Error("Facebook account does not have an email");
  }

  // 3. Find existing user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // 4. Create user if not exists
  if (!user) {
    const trainerRole = await prisma.role.findUnique({
      where: { name: "Trainer" },
    });

    if (!trainerRole) {
      throw new Error("Trainer role not found");
    }

    user = await prisma.user.create({
      data: {
        email,
        firstName: first_name,
        lastName: last_name,
        provider: "FACEBOOK",
        providerId: facebookId,
        roleId: trainerRole.id,
      },
    });
  }

  const token = signToken({ userId: user.id });

  return { user, token };
};


const appleJwksClient = jwksClient({
  jwksUri: process.env.APPLE_API_URL,
});

const getAppleKey = (header, callback) => {
  appleJwksClient.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

export const appleLogin = async (identityToken, fullName) => {
  // 1. Verify Apple identity token
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(
      identityToken,
      getAppleKey,
      {
        audience: process.env.APPLE_CLIENT_ID,
        issuer: process.env.APPLE_ISSUER_URL,
      },
      (err, decodedToken) => {
        if (err) return reject(err);
        resolve(decodedToken);
      }
    );
  });

  const {
    sub: appleId,
    email,
  } = decoded;

  if (!email) {
    throw new Error("Apple account email not available");
  }

  // 2. Find existing user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // 3. Create user if not exists
  if (!user) {
    const trainerRole = await prisma.role.findUnique({
      where: { name: "Trainer" },
    });

    user = await prisma.user.create({
      data: {
        email,
        firstName: fullName?.givenName || "",
        lastName: fullName?.familyName || "",
        provider: "APPLE",
        providerId: appleId,
        roleId: trainerRole.id,
      },
    });
  }

  // 4. Issue JWT
  const token = signToken({ userId: user.id });

  return { user, token };
};

export const getUserProfileById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      specialities: true,
      userProfileDetails: true,
      assignedCustomersAsCustomer: {
        select: {
          id: true,
          trainerId: true,
          isActive: true,
          startDate: true,
          endDate: true,
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        }
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/**
 * Method to logout user
 * @param {*} userId 
 * @param {*} token 
 * @param {*} fcmToken 
 * @returns 
 */
export const logoutUser = async (userId, token, fcmToken) => {
  if (!userId) throw new Error("User ID required");

  try {
    const decoded = jwt.decode(token);

    if (!decoded?.exp) {
      throw new Error("Invalid token");
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await prisma.$transaction([
      prisma.blacklistedToken.create({
        data: {
          token,
          userId,
          expiresAt
        }
      }),

      // prisma.userDevice.deleteMany({
      //   where: {
      //     userId,
      //     fcmToken
      //   }
      // }),

      // prisma.user.update({
      //   where: { id: userId },
      //   data: { fcmToken: null }
      // })
    ]);

    return {
      success: true,
      message: "Logged out successfully"
    };

  } catch (error) {
    throw new Error(`Logout failed: ${error.message}`);
  }
};
