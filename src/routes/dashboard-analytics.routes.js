import { Router } from "express";
import { getDashboardAnalyticsController } from "../controllers/dashboard-analytics.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard analytics for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics summary
 */
router.get("/analytics", authMiddleware, getDashboardAnalyticsController);

export default router;
