import express from "express";
import { createLogHandler, getLogsHandler, getLogByIdHandler, getStatsHandler, deleteLogHandler } from "../controllers/operational-log.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/mentor/operational-logs:
 *   post:
 *     summary: Create operational log
 *     tags: [Mentor Operational Logs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ptId, date, activityType]
 *             properties:
 *               ptId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               activityType:
 *                 type: string
 *                 enum: [TRANSCRIPT_REVIEW, SESSION_PLANNING, FEEDBACK_SESSION, ASSESSMENT, PERFORMANCE_REVIEW, OTHER]
 *               hours:
 *                 type: integer
 *               minutes:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Log created successfully
 */
router.post("/", authMiddleware, createLogHandler);

/**
 * @swagger
 * /api/mentor/operational-logs:
 *   get:
 *     summary: Get all operational logs
 *     tags: [Mentor Operational Logs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Logs fetched successfully
 */
router.get("/", authMiddleware, getLogsHandler);

/**
 * @swagger
 * /api/mentor/operational-logs/stats:
 *   get:
 *     summary: Get operational logs stats
 *     tags: [Mentor Operational Logs]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 */
router.get("/stats", authMiddleware, getStatsHandler);

/**
 * @swagger
 * /api/mentor/operational-logs/{logId}:
 *   get:
 *     summary: Get log details
 *     tags: [Mentor Operational Logs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Log fetched successfully
 */
router.get("/:logId", authMiddleware, getLogByIdHandler);

/**
 * @swagger
 * /api/mentor/operational-logs/{logId}:
 *   delete:
 *     summary: Delete operational log
 *     tags: [Mentor Operational Logs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Log deleted successfully
 */
router.delete("/:logId", authMiddleware, deleteLogHandler);

export default router;
