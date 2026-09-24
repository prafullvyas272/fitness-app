import express from "express";
import {
  createGymRentHandler,
  updateGymRentHandler,
  getGymRentHandler,
  getAllGymRentsHandler,
  deleteGymRentHandler,
} from "../controllers/gym-rent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/gym-rent:
 *   post:
 *     summary: Create gym rent for a trainer (Admin only)
 *     description: Admin can set the gym rent amount for a specific trainer
 *     tags:
 *       - Admin - Gym Rent
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trainerId
 *               - rentAmount
 *             properties:
 *               trainerId:
 *                 type: string
 *                 example: "6a881a618ed82423f090ab03"
 *               rentAmount:
 *                 type: number
 *                 example: 5000
 *               rentFrequency:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, YEARLY]
 *                 default: MONTHLY
 *                 example: MONTHLY
 *               currency:
 *                 type: string
 *                 default: USD
 *                 example: USD
 *               description:
 *                 type: string
 *                 example: "Gym rent for trainer"
 *               notes:
 *                 type: string
 *                 example: "Payment due on 1st of month"
 *     responses:
 *       201:
 *         description: Gym rent created successfully
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
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       404:
 *         description: Trainer not found
 *       409:
 *         description: Gym rent already exists for this trainer
 */
router.post(
  "/",
  authMiddleware,
  superadminMiddleware,
  createGymRentHandler
);

/**
 * @swagger
 * /api/admin/gym-rent/{trainerId}:
 *   put:
 *     summary: Update gym rent for a trainer (Admin only)
 *     description: Admin can update the gym rent amount and details for a specific trainer
 *     tags:
 *       - Admin - Gym Rent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rentAmount:
 *                 type: number
 *                 example: 5500
 *               rentFrequency:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, YEARLY]
 *               currency:
 *                 type: string
 *                 example: USD
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gym rent updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Gym rent not found for this trainer
 */
router.put(
  "/:trainerId",
  authMiddleware,
  superadminMiddleware,
  updateGymRentHandler
);

/**
 * @swagger
 * /api/admin/gym-rent/{trainerId}:
 *   get:
 *     summary: Get gym rent for a specific trainer (Admin only)
 *     description: Admin can view the gym rent details for a specific trainer
 *     tags:
 *       - Admin - Gym Rent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Gym rent fetched successfully
 *       404:
 *         description: Gym rent not found
 */
router.get(
  "/:trainerId",
  authMiddleware,
  superadminMiddleware,
  getGymRentHandler
);

/**
 * @swagger
 * /api/admin/gym-rent:
 *   get:
 *     summary: Get all gym rents (Admin only)
 *     description: Admin can view all trainer gym rent records with pagination
 *     tags:
 *       - Admin - Gym Rent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Gym rents fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     gymRents:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 */
router.get(
  "/",
  authMiddleware,
  superadminMiddleware,
  getAllGymRentsHandler
);

/**
 * @swagger
 * /api/admin/gym-rent/{trainerId}:
 *   delete:
 *     summary: Delete gym rent for a trainer (Admin only)
 *     description: Admin can delete the gym rent record for a specific trainer
 *     tags:
 *       - Admin - Gym Rent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Gym rent deleted successfully
 *       404:
 *         description: Gym rent not found
 */
router.delete(
  "/:trainerId",
  authMiddleware,
  superadminMiddleware,
  deleteGymRentHandler
);

export default router;
