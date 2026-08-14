import express from "express";
import {
  getAllReportsHandler,
  getReportByIdHandler,
  updateReportStatusHandler,
  getActivityFeedHandler,
  getReportStatsHandler,
  getReportsSummaryHandler
} from "../controllers/mentor-reports.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/mentor/reports:
 *   get:
 *     summary: Get all reports with filtering & pagination
 *     tags: [Mentor Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_REVIEW, RESOLVED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [CRITICAL, HIGH, ROUTINE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [CONDUCT, TECHNICAL, PERFORMANCE]
 *       - in: query
 *         name: trainerId
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 */
router.get("/", authMiddleware, getAllReportsHandler);

/**
 * @swagger
 * /api/mentor/reports/activity/feed:
 *   get:
 *     summary: Get activity feed
 *     tags: [Mentor Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Activity feed fetched successfully
 */
router.get("/activity/feed", authMiddleware, getActivityFeedHandler);

/**
 * @swagger
 * /api/mentor/reports/stats:
 *   get:
 *     summary: Get report statistics
 *     tags: [Mentor Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 */
router.get("/stats", authMiddleware, getReportStatsHandler);

/**
 * @swagger
 * /api/mentor/reports/summary:
 *   get:
 *     summary: Get reports summary (dashboard)
 *     tags: [Mentor Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary fetched successfully
 */
router.get("/summary", authMiddleware, getReportsSummaryHandler);

/**
 * @swagger
 * /api/mentor/reports/{reportId}:
 *   get:
 *     summary: Get single report details
 *     tags: [Mentor Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report fetched successfully
 *       404:
 *         description: Report not found
 */
router.get("/:reportId", authMiddleware, getReportByIdHandler);

/**
 * @swagger
 * /api/mentor/reports/{reportId}:
 *   put:
 *     summary: Update report status
 *     tags: [Mentor Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_REVIEW, RESOLVED]
 *               priority:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, ROUTINE]
 *               resolutionNotes:
 *                 type: string
 *               action:
 *                 type: string
 *                 example: status_update
 *     responses:
 *       200:
 *         description: Report updated successfully
 */
router.put("/:reportId", authMiddleware, updateReportStatusHandler);

export default router;
