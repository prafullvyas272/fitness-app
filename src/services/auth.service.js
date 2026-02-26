import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";
import prisma from "../utils/prisma.js";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/node-mailer.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import RoleEnum from "../enums/RoleEnum.js";
import { TEMPORARY_SUPER_OTP } from "../constants/constants.js";

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);
const OTP_EXPIRY_MINUTES = 5;


export const registerUser = async (firstName, lastName, email, phone, password, role, gender = null) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(role)
  const roleData = await prisma.role.findUnique({
    where: { name: role },
  });

  if (!roleData) {
    throw new Error("Invalid Role. The role not found in the database.");
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      gender,
      password: hashedPassword,
      roleId: roleData.id,
    },
  });

  setImmediate(() => {
    sendOtp(user.id).catch(err => {
      console.error("OTP sending failed:", err);
    });
  });

  return { user };
};

export const loginUser = async (email, password) => {
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
      }
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


  if (user.role && user.role.name === RoleEnum.SUPERADMIN) {
    const access_token = signToken({ userId: user.id });
    const refresh_token = signToken({ userId: user.id }, { expiresIn: "30d", type: "refresh" });
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
    const refresh_token = signToken({ userId: user.id }, { expiresIn: "30d", type: "refresh" });
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

  if (otp != TEMPORARY_SUPER_OTP) {
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

  return {
    user: updatedUser,
    // access_token,
    // refresh_token,
  };
};

/* RESEND OTP */
export const resendOtp = async (userId) => {
  return sendOtp(userId);
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
