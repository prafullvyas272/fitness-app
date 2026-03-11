import express from "express";
import { getAllTrainerRequestsHandler } from "../controllers/trainer-request.controller.js";
/**
 * @swagger
 * /trainer-requests:
 *   get:
 *     summary: Get all trainer requests
 *     description: Retrieve a list of all trainer requests, including related customer and trainer information.
 *     tags:
 *       - Trainer Requests
 *     responses:
 *       200:
 *         description: Trainer requests fetched successfully
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
 *                   example: Trainer requests fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       customerId:
 *                         type: string
 *                       trainerId:
 *                         type: string
 *                       message:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       customer:
 *                         type: object
 *                         description: Customer user object
 *                       trainer:
 *                         type: object
 *                         description: Trainer user object
 *       400:
 *         description: Failed to fetch trainer requests
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
 *                   example: Failed to fetch trainer requests: error message
 */
const router = express.Router();

router.get(
  "/trainer-requests",
  // Add authentication/authorization middlewares here as needed, e.g.:
  // authMiddleware,
  getAllTrainerRequestsHandler
);

export default router;