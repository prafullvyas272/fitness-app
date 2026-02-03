import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { signToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

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
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = signToken({ userId: user.id });

  return { user, token };
};
