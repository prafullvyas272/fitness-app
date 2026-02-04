import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validation.js";
import {
  sendOtpHandler,
  verifyOtpHandler,
  resendOtpHandler,
} from "../controllers/auth.controller.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../validators/auth.validation.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
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
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered
 *       422:
 *         description: Validation error
 *       400:
 *         description: Registration error
 */
router.post(
  "/register",
  validate(registerSchema),
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       422:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  validate(loginSchema),
  login
);

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to whom the OTP will be sent
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Failed to send OTP
 *       422:
 *         description: Validation error
 */
router.post("/send-otp", validate(sendOtpSchema), sendOtpHandler);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify the OTP entered by the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID whose OTP needs to be verified
 *               otp:
 *                 type: string
 *                 description: One-time password (6 digits)
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       422:
 *         description: Validation error
 */
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpHandler);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to whom the OTP will be resent
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Failed to resend OTP
 *       422:
 *         description: Validation error
 */
router.post("/resend-otp", validate(resendOtpSchema), resendOtpHandler);

export default router;
