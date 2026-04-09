import express from "express";
import {
  createTrainerHandler,
  updateTrainerHandler,
  deleteTrainerHandler,
  showTrainerProfileDataHandler,
  getTrainerSessionsByMonthAndYearHandler,
  getAssignedCustomersByTrainerIdHandler,
} from "../controllers/trainer.controller.js";
import {
  trainerForgotPasswordHandler,
  trainerMobileForgotPasswordHandler,
  trainerMobileVerifyOtpHandler,
  trainerResetPasswordHandler,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
const router = express.Router();

/**
/**
 * @swagger
 * /api/trainers:
 *   post:
 *     summary: Create a new trainer user
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
 *               hostGymName:
 *                 type: string
 *               hostGymAddress:
 *                 type: string
 *               address:
 *                 type: string
 *               bio:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum:
 *                   - MALE
 *                   - FEMALE
 *                   - OTHER
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Trainer created successfully.
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
 *                   example: Trainer created successfully
 *                 data:
 *                   type: object
 *                   nullable: true
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
  "/api/trainers",
  authMiddleware,
  superadminMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "trainerPhoto", maxCount: 1 },
  ]),
  createTrainerHandler
);

/**
/**
/**
 * @swagger
 * /api/trainers/{id}:
 *   put:
 *     summary: Update an existing trainer user
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
 *         description: ID of the trainer to update
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
 *               hostGymName:
 *                 type: string
 *               hostGymAddress:
 *                 type: string
 *               address:
 *                 type: string
 *               bio:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum:
 *                   - MALE
 *                   - FEMALE
 *                   - OTHER
 *               isActive:
 *                 type: boolean
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Trainer updated successfully.
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
 *                   example: Trainer updated successfully
 *                 data:
 *                   type: object
 *                   nullable: true
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
router.put(
  "/api/trainers/:id",
  authMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "trainerPhoto", maxCount: 1 },
  ]),
  updateTrainerHandler
);

/**
 * @swagger
 * /api/trainers/{id}:
 *   delete:
 *     summary: Delete a trainer user
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
 *         description: ID of the trainer to delete
 *     responses:
 *       200:
 *         description: Trainer deleted successfully.
 *       400:
 *         description: Error occurred.
 */
router.delete(
  "/api/trainers/:id",
  authMiddleware,
  superadminMiddleware,
  deleteTrainerHandler
);

/**
 * @swagger
 * /api/trainers/{id}/profile:
 *   get:
 *     summary: Get a trainer's profile data
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
 *         description: ID of the trainer
 *     responses:
 *       200:
 *         description: Trainer profile data fetched successfully.
 *       400:
 *         description: Error occurred.
 */
router.get(
  "/api/trainers/:id/profile",
  authMiddleware,
  showTrainerProfileDataHandler
);


/**
 * @swagger
 * /api/trainers/{id}/sessions:
 *   get:
 *     summary: Get trainer sessions by month and year
 *     tags:
 *       - Customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the trainer
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: Month to filter sessions (e.g., 01 for January)
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Year to filter sessions (e.g., 2024)
 *     responses:
 *       200:
 *         description: Trainer sessions fetched successfully.
 *       400:
 *         description: Error occurred.
 */
router.get(
  "/api/trainers/:id/sessions",
  authMiddleware,
  getTrainerSessionsByMonthAndYearHandler
);

/**
 * @swagger
 * /api/trainer/assigned-customers:
 *   get:
 *     summary: Get all customers currently assigned to the logged-in trainer
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned customers fetched successfully.
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       customer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           gender:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           userProfileDetail:
 *                             type: object
 *                             nullable: true
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Error occurred.
 */
router.get(
  "/api/trainer/assigned-customers",
  authMiddleware,
  getAssignedCustomersByTrainerIdHandler
);

/**
 * @swagger
 * /api/trainer/forgot-password:
 *   post:
 *     summary: Trainer forgot password
 *     tags:
 *       - Trainer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: trainer@example.com
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
  "/api/trainer/forgot-password",
  trainerForgotPasswordHandler
);

/**
 * @swagger
 * /api/trainer/mobile/forgot-password:
 *   post:
 *     summary: Trainer mobile forgot password OTP
 *     tags:
 *       - Trainer
 *     description: |
 *       Generates a temporary OTP for trainer password reset using mobile number.
 *       For now, SMS sending is disabled and the OTP used is always `123456`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *     responses:
 *       200:
 *         description: Mobile OTP generated successfully.
 *       400:
 *         description: Error occurred.
 */
router.post(
  "/api/trainer/mobile/forgot-password",
  trainerMobileForgotPasswordHandler
);

/**
 * @swagger
 * /api/trainer/mobile/verify-otp:
 *   post:
 *     summary: Verify trainer mobile forgot password OTP
 *     tags:
 *       - Trainer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Error occurred.
 */
router.post(
  "/api/trainer/mobile/verify-otp",
  trainerMobileVerifyOtpHandler
);

/**
 * @swagger
 * /api/trainer/reset-password:
 *   post:
 *     summary: Trainer reset password
 *     tags:
 *       - Trainer
 *     description: |
 *       Supports both email OTP flow and mobile OTP flow.
 *       After OTP verification, submit either `email` or `phone` with `password` and `confirm_password`.
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
 *                 example: trainer@example.com
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
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
 *       400:
 *         description: Error occurred.
 */
router.post(
  "/api/trainer/reset-password",
  trainerResetPasswordHandler
);

export default router;
