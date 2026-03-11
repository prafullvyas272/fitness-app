import express from "express";
import { getAllTrainerRequestsHandler, updateTrainerRequestStatusHandler } from "../controllers/trainer-request.controller.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
/**
 * @swagger
 * /api/trainer-requests:
 *   get:
 *     summary: Get all trainer requests
 *     description: Retrieve a list of all trainer requests, including related customer and trainer information.
 *     tags:
 *       - Trainer Requests
 *     security:
 *       - bearerAuth: []
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
 *                   example: "Failed to fetch trainer requests: error message"
 */

const router = express.Router();

router.get(
  "/trainer-requests",
  authMiddleware,
  superadminMiddleware,
  getAllTrainerRequestsHandler
);


/**
 * @swagger
 * /api/trainer-requests/{requestId}/status:
 *   patch:
 *     summary: Update trainer request status (approve/reject)
 *     description: Approve or reject a trainer request by updating its status. Only accessible by superadmin.
 *     tags:
 *       - Trainer Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trainer request to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Trainer request status updated successfully
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
 *                   example: Trainer request status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedRequest:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         customerId:
 *                           type: string
 *                         trainerId:
 *                           type: string
 *                         message:
 *                           type: string
 *                         status:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     assignedCustomer:
 *                       type: object
 *                       nullable: true
 *                       description: Assigned customer object if created, otherwise null
 *       400:
 *         description: Failed to update trainer request status
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
 *                   example: "Failed to update trainer request: error message"
 */
router.patch(
  "/trainer-requests/:requestId/status",
  authMiddleware,
  superadminMiddleware,
  updateTrainerRequestStatusHandler
);


export default router;