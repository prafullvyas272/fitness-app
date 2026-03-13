import express from "express";
import {
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  showCustomerProfileDataHandler,
  applyForUPTHandler,
} from "../controllers/customer.controller.js";
import { customerForgotPasswordHandler, customerResetPasswordHandler } from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer user
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *               avatar:
 *                 type: string
 *                 format: binary
 *               gender:
 *                 type: string
 *                 enum:
 *                   - MALE
 *                   - FEMALE
 *                   - OTHER
 *     responses:
 *       201:
 *         description: Customer created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Customer created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error description
 */
router.post(
  "/api/customers",
  authMiddleware,
  superadminMiddleware,
  upload.single("avatar"),
  createCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update an existing customer user
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *               isActive:
 *                 type: boolean
 *               avatar:
 *                 type: string
 *                 format: binary
 *               gender:
 *                 type: string
 *                 enum:
 *                   - MALE
 *                   - FEMALE
 *                   - OTHER
 *     responses:
 *       200:
 *         description: Customer updated successfully.
 *       400:
 *         description: Error occurred.
 */
router.put(
  "/api/customers/:id",
  authMiddleware,
  superadminMiddleware,
  upload.single("avatar"),
  updateCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer user
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to delete
 *     responses:
 *       200:
 *         description: Customer deleted successfully.
 *       400:
 *         description: Error occurred.
 */
router.delete(
  "/api/customers/:id",
  authMiddleware,
  superadminMiddleware,
  deleteCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}/profile:
 *   get:
 *     summary: Get a customer's profile data
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer
 *     responses:
 *       200:
 *         description: Customer profile data fetched successfully.
 *       400:
 *         description: Error occurred.
 */
router.get(
  "/api/customers/:id/profile",
  authMiddleware,
  showCustomerProfileDataHandler
);


/**
 * @swagger
 * /api/customers/apply-upt:
 *   post:
 *     summary: Customer applies for a personal trainer (UPT)
 *     tags:
 *       - Customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainerId:
 *                 type: string
 *                 description: ID of the trainer to apply to
 *               message:
 *                 type: string
 *                 description: Optional message to the trainer
 *     responses:
 *       201:
 *         description: Trainer request submitted successfully.
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
 *                   description: The created TrainerRequest record
 *       400:
 *         description: Error occurred.
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
router.post(
  "/api/customers/apply-upt",
  authMiddleware,
  applyForUPTHandler
);

/**
 * @swagger
 * /api/customer/forgot-password:
 *   post:
 *     summary: Customer forgot/reset password (OTP based)
 *     tags:
 *       - Customer
 *     description: |
 *       Two-step OTP based password reset flow.
 *       - First call with `email` only to receive an OTP via email.
 *       - Second call with `email` and `otp` to verify the OTP.
 *       - Third call with `email`, `password`, and `confirm_password` to change the password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrong@123
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: NewStrong@123
 *     responses:
 *       200:
 *         description: Password reset email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Error occurred.
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
router.post(
  "/api/customer/forgot-password",
  customerForgotPasswordHandler
);


/**
 * @swagger
 * /api/customer/reset-password:
 *   post:
 *     summary: Reset password for customer (by OTP verification and new password)
 *     tags:
 *       - Customer
 *     description: |
 *       Step 1: Verify OTP (with email and otp only).<br>
 *       Step 2: Submit new password (with email, otp, password, and confirm_password).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrong@123
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: NewStrong@123
 *     responses:
 *       200:
 *         description: OTP verified or password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: OTP invalid or mismatched passwords
 */
router.post(
  "/api/customer/reset-password",
  customerResetPasswordHandler
);

export default router;
