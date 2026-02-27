import express from "express";
import {
  createTrainerHandler,
  updateTrainerHandler,
  deleteTrainerHandler,
  showTrainerProfileDataHandler,
} from "../controllers/trainer.controller.js";

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
  upload.single("avatar"),
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
  upload.single("avatar"),
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

export default router;
