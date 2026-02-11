import express from "express";
import {
  createTrainerHandler,
  updateTrainerHandler,
  deleteTrainerHandler,
  showTrainerProfileDataHandler,
} from "../controllers/trainer.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

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
 *         application/json:
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
 *               password:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Trainer created successfully.
 *       400:
 *         description: Error occurred.
 */
router.post(
  "/api/trainers",
  authMiddleware,
  superadminMiddleware,
  createTrainerHandler
);

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
 *         application/json:
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
 *     responses:
 *       200:
 *         description: Trainer updated successfully.
 *       400:
 *         description: Error occurred.
 */
router.put(
  "/api/trainers/:id",
  authMiddleware,
  superadminMiddleware,
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
