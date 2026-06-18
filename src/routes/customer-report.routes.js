import express from "express";
import {
  createCustomerReportHandler,
  getMyCustomerReportsHandler,
  getAllCustomerReportsHandler,
  updateCustomerReportStatusHandler,
} from "../controllers/customer-report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/customer-reports:
 *   post:
 *     summary: Submit a report/issue (Customer only)
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
 *               - subject
 *               - category
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Trainer was not available"
 *               category:
 *                 type: string
 *                 enum: [CONDUCT, PERFORMANCE, ATTENDANCE, PAYMENT, OTHER]
 *                 example: ATTENDANCE
 *               priority:
 *                 type: string
 *                 enum: [ROUTINE, HIGH, CRITICAL]
 *                 default: ROUTINE
 *                 example: HIGH
 *               description:
 *                 type: string
 *                 example: "My trainer missed 3 sessions without any notice."
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *       400:
 *         description: Validation error
 */
router.post("/customer-reports", authMiddleware, createCustomerReportHandler);

/**
 * @swagger
 * /api/customer-reports/me:
 *   get:
 *     summary: Get current customer's own reports with status updates
 *     tags:
 *       - Customer Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [OPEN, IN_REVIEW, RESOLVED]
 *                       adminNote:
 *                         type: string
 *                       createdAt:
 *                         type: string
 */
router.get("/customer-reports/me", authMiddleware, getMyCustomerReportsHandler);

/**
 * @swagger
 * /api/admin/customer-reports:
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
 *           enum: [OPEN, IN_REVIEW, RESOLVED]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [CONDUCT, PERFORMANCE, ATTENDANCE, PAYMENT, OTHER]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [ROUTINE, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: Customer reports fetched successfully
 */
router.get("/admin/customer-reports", authMiddleware, superadminMiddleware, getAllCustomerReportsHandler);

/**
 * @swagger
 * /api/admin/customer-reports/{id}:
 *   patch:
 *     summary: Update report status / add admin note (Admin only)
 *     tags:
 *       - Customer Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 example: IN_REVIEW
 *               adminNote:
 *                 type: string
 *                 example: "We have reviewed your complaint and taken action."
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       400:
 *         description: Error
 */
router.patch("/admin/customer-reports/:id", authMiddleware, superadminMiddleware, updateCustomerReportStatusHandler);

export default router;
