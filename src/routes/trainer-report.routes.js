import express from "express";
import {
  createTrainerReportHandler,
  getTrainerReportsByAdminHandler,
  getTrainerReportsByTrainerHandler,
  getReportByBookingHandler,
  updateReportStatusHandler,
  deleteReportHandler
} from "../controllers/trainer-report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trainer-reports:
 *   post:
 *     summary: Report a trainer for issues during session
 *     tags:
 *       - Trainer Reports
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - trainerId
 *               - reason
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *               trainerId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *               reason:
 *                 type: string
 *                 enum: [BEHAVIOR, QUALITY, NO_SHOW, PROFESSIONALISM, OTHER]
 *                 example: "BEHAVIOR"
 *               description:
 *                 type: string
 *                 example: "Trainer was unprofessional and rude during the session"
 *     responses:
 *       201:
 *         description: Report submitted successfully
 */
router.post("/", authMiddleware, createTrainerReportHandler);

/**
 * @swagger
 * /api/trainer-reports/admin:
 *   get:
 *     summary: Get all trainer reports (Admin only)
 *     tags:
 *       - Trainer Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RESOLVED, REJECTED]
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 */
router.get("/admin", authMiddleware, superadminMiddleware, getTrainerReportsByAdminHandler);

/**
 * @swagger
 * /api/trainer-reports/trainer/{trainerId}:
 *   get:
 *     summary: Get reports filed against a specific trainer
 *     tags:
 *       - Trainer Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
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
router.get("/trainer/:trainerId", authMiddleware, getTrainerReportsByTrainerHandler);

/**
 * @swagger
 * /api/trainer-reports/booking/{bookingId}:
 *   get:
 *     summary: Get report for a specific booking
 *     tags:
 *       - Trainer Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report fetched successfully
 */
router.get("/booking/:bookingId", authMiddleware, getReportByBookingHandler);

/**
 * @swagger
 * /api/trainer-reports/{reportId}/status:
 *   put:
 *     summary: Update report status (Admin only)
 *     tags:
 *       - Trainer Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, RESOLVED, REJECTED]
 *                 example: "RESOLVED"
 *     responses:
 *       200:
 *         description: Report status updated successfully
 */
router.put("/:reportId/status", authMiddleware, superadminMiddleware, updateReportStatusHandler);

/**
 * @swagger
 * /api/trainer-reports/{reportId}:
 *   delete:
 *     summary: Delete a report
 *     tags:
 *       - Trainer Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 */
router.delete("/:reportId", authMiddleware, deleteReportHandler);

export default router;
