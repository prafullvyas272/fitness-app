import express from "express";
import { getAdminDashboardStatsHandler } from "../controllers/admin-dashboard.controller.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get combined admin dashboard statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *         description: 1-indexed month to scope "this month" figures (defaults to current month)
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         description: Year to scope "this month" figures (defaults to current year)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *         description: Number of recent members to return
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [monthly, yearly, custom], default: monthly }
 *         description: Shape of revenueChart - monthly (last 6 months), yearly (last 5 years), or custom (bucketed by month across startDate/endDate)
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Required when period=custom. Format YYYY-MM-DD.
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Required when period=custom. Format YYYY-MM-DD.
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden - superadmin access required
 */
router.get("/stats", superadminMiddleware, getAdminDashboardStatsHandler);

export default router;
