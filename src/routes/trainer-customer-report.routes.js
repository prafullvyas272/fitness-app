import express from "express";
import {
  createCustomerReportHandler,
  getCustomerReportsByAdminHandler,
  getCustomerReportsByTrainerHandler,
  getCustomerReportsByCustomerHandler,
  getReportByBookingHandler,
  updateReportStatusHandler,
  deleteReportHandler
} from "../controllers/trainer-customer-report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/customer-reports:
 *   post:
 *     summary: Report a customer for issues during session (Trainer only)
 *     description: Trainer can report a customer only within 24 hours after session is marked as ATTENDED
 *     tags:
 *       - Customer Reports
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
 *               - customerId
 *               - reason
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *               customerId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *               reason:
 *                 type: string
 *                 enum: [BEHAVIOR, NO_SHOW, DISRESPECT, PAYMENT_ISSUE, OTHER]
 *                 example: "BEHAVIOR"
 *               description:
 *                 type: string
 *                 example: "Customer was extremely rude and disruptive during session"
 *     responses:
 *       201:
 *         description: Report submitted successfully (within 24 hours of attended session)
 *       400:
 *         description: Cannot report after 24 hours or session not marked as attended
 *       409:
 *         description: Report already exists for this booking
 */
router.post("/", authMiddleware, createCustomerReportHandler);

/**
 * @swagger
 * /api/customer-reports/admin:
 *   get:
 *     summary: Get all customer reports (Admin only)
 *     tags:
 *       - Customer Reports
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
router.get("/admin", authMiddleware, superadminMiddleware, getCustomerReportsByAdminHandler);

/**
 * @swagger
 * /api/customer-reports/trainer:
 *   get:
 *     summary: Get reports submitted by logged-in trainer
 *     tags:
 *       - Customer Reports
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
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 */
router.get("/trainer", authMiddleware, getCustomerReportsByTrainerHandler);

/**
 * @swagger
 * /api/customer-reports/customer/{customerId}:
 *   get:
 *     summary: Get reports filed against a specific customer
 *     tags:
 *       - Customer Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
router.get("/customer/:customerId", authMiddleware, getCustomerReportsByCustomerHandler);

/**
 * @swagger
 * /api/customer-reports/booking/{bookingId}:
 *   get:
 *     summary: Get report for a specific booking
 *     tags:
 *       - Customer Reports
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
 * /api/customer-reports/{reportId}/status:
 *   put:
 *     summary: Update report status (Admin only)
 *     tags:
 *       - Customer Reports
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
 * /api/customer-reports/{reportId}:
 *   delete:
 *     summary: Delete a report (Trainer only - can only delete own reports)
 *     tags:
 *       - Customer Reports
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
