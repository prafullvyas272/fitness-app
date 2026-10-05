import express from "express";
import { getAllReportsForAdminHandler } from "../controllers/combined-report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: (Admin) Get all reports - customers reporting trainers and trainers reporting customers
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [CUSTOMER_REPORTED_TRAINER, TRAINER_REPORTED_CUSTOMER]
 *         description: Optional - filter to one report direction
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RESOLVED]
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
 *         description: Reports fetched successfully
 */
router.get("/reports", authMiddleware, superadminMiddleware, getAllReportsForAdminHandler);

export default router;
