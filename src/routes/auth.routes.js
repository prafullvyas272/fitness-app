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
  facebookLoginHandler,
  appleLoginHandler,
} from "../controllers/auth.controller.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *       - Customer
 *       - Trainer
 *     summary: Register user
 *     description: Register a new user as Trainer or Customer.
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
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *               role:
 *                 type: string
 *                 enum: [Trainer, Customer]
 *                 example: Trainer
 *           examples:
 *             TrainerSignup:
 *               summary: Trainer registration
 *               value:
 *                 firstName: John
 *                 lastName: Doe
 *                 email: trainer@example.com
 *                 phone: "+1234567890"
 *                 password: Strong@123
 *                 role: Trainer
 *             CustomerSignup:
 *               summary: Customer registration
 *               value:
 *                 firstName: Jane
 *                 lastName: Smith
 *                 email: customer@example.com
 *                 phone: "+1987654321"
 *                 password: Strong@123
 *                 role: Customer
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *       - Superadmin
 *       - Customer
 *       - Trainer
 *     summary: Login user
 *     description: Login an existing user using email and password.
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
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Send OTP to user
 *     description: Send an OTP to the user by userId.
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
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/send-otp", validate(sendOtpSchema), sendOtpHandler);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify OTP
 *     description: Verify a user's OTP using userId and otp code.
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
 *                 example: "123"
 *               otp:
 *                 type: integer
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpHandler);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend OTP
 *     description: Resend an OTP to a user by userId.
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
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/resend-otp", validate(resendOtpSchema), resendOtpHandler);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with Google
 *     description: Login user using Google ID token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI..."
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post("/google", googleLoginHandler);


/**
 * @swagger
 * /api/auth/facebook:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with Facebook
 *     description: Login user using Facebook access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: "EAAGm0PX4ZCpsBA..."
 *     responses:
 *       200:
 *         description: Facebook login successful
 */
router.post("/facebook", facebookLoginHandler);


/**
 * @swagger
 * /api/auth/apple:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with Apple
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identityToken
 *             properties:
 *               identityToken:
 *                 type: string
 *               fullName:
 *                 type: object
 */
router.post("/apple", appleLoginHandler);



export default router;
