import { z } from "zod";
import { findUserByEmail } from "../services/auth.service.js";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters"),

    email: z
      .string()
      .email("Invalid email address"),

    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  })
  .refine(
    async (data) => {
      const user = await findUserByEmail(data.email);
      return !user; // must be false if email exists
    },
    {
      path: ["email"],
      message: "User with this email already exists",
    }
  );

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});
