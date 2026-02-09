import express from "express";
import { getTrainerSlotsByDateHandler } from "../controllers/time-slot.controller.js";

/**
 * @swagger
 * /api/trainer/{trainerId}/time-slots:
 *   get:
 *     summary: Get paginated time slots for a trainer on a specific date
 *     tags:
 *       - TimeSlots
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the trainer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date to filter slots (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Trainer time slots fetched successfully.
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
 *                   example: Trainer time slots fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           dailyAvailabilityId:
 *                             type: string
 *                           trainerId:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           endTime:
 *                             type: string
 *                             format: date-time
 *                           slotType:
 *                             type: string
 *                           durationMinutes:
 *                             type: integer
 *                           isBooked:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: Date is required
 */
const router = express.Router();

router.get(
  "/trainer/:trainerId/time-slots",
  // (authMiddleware can be added here if required)
  getTrainerSlotsByDateHandler
);

export default router;
