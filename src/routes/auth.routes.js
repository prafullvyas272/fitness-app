import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../validators/auth.validation.js";
import {
  sendOtpHandler,
  verifyOtpHandler,
  resendOtpHandler,
  googleLoginHandler,
} from "../controllers/auth.controller.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Send OTP to user
 */
router.post("/send-otp", validate(sendOtpSchema), sendOtpHandler);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify OTP
 */
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpHandler);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend OTP
 */
router.post("/resend-otp", validate(resendOtpSchema), resendOtpHandler);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with Google
 */
router.post("/google", googleLoginHandler);

export default router;
