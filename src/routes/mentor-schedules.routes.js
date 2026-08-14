import express from "express";
import {
  getAllSchedulesHandler,
  getSchedulesByDateRangeHandler,
  getScheduleAlertsHandler,
  acknowledgeAlertHandler,
  getScheduleStatsHandler,
  getAlertsSummaryHandler
} from "../controllers/mentor-schedules.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/mentor/schedules:
 *   get:
 *     summary: Get all schedules (View Only)
 *     tags: [Mentor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Filter by specific date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, rescheduled, cancelled, completed]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Schedules fetched successfully
 *       400:
 *         description: Invalid request
 */
router.get("/", authMiddleware, getAllSchedulesHandler);

/**
 * @swagger
 * /api/mentor/schedules/range:
 *   get:
 *     summary: Get schedules by date range (View Only)
 *     tags: [Mentor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date }
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Schedules by date range fetched successfully
 *       400:
 *         description: Invalid date range
 */
router.get("/range", authMiddleware, getSchedulesByDateRangeHandler);

/**
 * @swagger
 * /api/mentor/schedules/stats:
 *   get:
 *     summary: Get schedule statistics (View Only)
 *     tags: [Mentor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 */
router.get("/stats", authMiddleware, getScheduleStatsHandler);

/**
 * @swagger
 * /api/mentor/schedules/alerts:
 *   get:
 *     summary: Get schedule alerts (View Only)
 *     tags: [Mentor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Alerts fetched successfully
 */
router.get("/alerts", authMiddleware, getScheduleAlertsHandler);

/**
 * @swagger
 * /api/mentor/schedules/alerts/summary:
 *   get:
 *     summary: Get alerts summary (View Only)
 *     tags: [Mentor Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts summary fetched successfully
 */
router.get("/alerts/summary", authMiddleware, getAlertsSummaryHandler);

/**
 * @swagger
 * /api/mentor/schedules/alerts/{alertId}:
 *   put:
 *     summary: Acknowledge alert (Mentor can only acknowledge)
 *     tags: [Mentor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolved
 *               - action
 *             properties:
 *               resolved:
 *                 type: boolean
 *                 example: true
 *               action:
 *                 type: string
 *                 example: acknowledged
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Alert not found
 */
router.put("/alerts/:alertId", authMiddleware, acknowledgeAlertHandler);

export default router;
