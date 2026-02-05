import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";
import prisma from "../utils/prisma.js";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/node-mailer.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);
const OTP_EXPIRY_MINUTES = 5;


export const registerUser = async (firstName, lastName, email, phone, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Find the Trainer role id
  const trainerRole = await prisma.role.findUnique({
    where: { name: "Trainer" },
  });

  if (!trainerRole) {
    throw new Error("Trainer role not found in the roles table");
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      roleId: trainerRole.id,
    },
  });

  const token = signToken({ userId: user.id });

  return { user, token };
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      specialities: {
        select: {
          specialityId: true,
        },
      },
    },
  });

  if (!user) throw new Error("Invalid credentials");

  // Block Google users from password login
  if (user.provider !== "LOCAL") {
    throw new Error("Please login using Google");
  }

  if (!user.password) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = signToken({ userId: user.id });

  // Optional: clean response
  delete user.password;

  return { user, token };
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
  const record = await prisma.otp.findFirst({
    where: {
      userId,
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

  return true;
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

