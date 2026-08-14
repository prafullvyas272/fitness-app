import express from "express";
import {
  getDashboardOverviewHandler,
  getPerformanceTrajectoryHandler,
  getDashboardSummaryHandler
} from "../controllers/mentor-dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/mentor/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview with KPI stats
 *     tags: [Mentor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview fetched successfully
 */
router.get("/overview", authMiddleware, getDashboardOverviewHandler);

/**
 * @swagger
 * /api/mentor/dashboard/performance-trajectory:
 *   get:
 *     summary: Get performance trajectory chart data
 *     tags: [Mentor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7D, 30D]
 *           default: 7D
 *     responses:
 *       200:
 *         description: Performance trajectory fetched successfully
 */
router.get("/performance-trajectory", authMiddleware, getPerformanceTrajectoryHandler);

/**
 * @swagger
 * /api/mentor/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary (quick stats)
 *     tags: [Mentor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully
 */
router.get("/summary", authMiddleware, getDashboardSummaryHandler);

export default router;
