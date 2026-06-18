import express from "express";
import {
  createReportHandler,
  getAllReportsHandler,
  getReportByIdHandler,
} from "../controllers/report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Submit a report about a customer (Trainer only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - sessionDate
 *               - category
 *               - description
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "6a2fc40c7a2560df268d01ea"
 *               sessionDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-18"
 *               category:
 *                 type: string
 *                 enum: [CONDUCT, PERFORMANCE, ATTENDANCE, PAYMENT, OTHER]
 *                 example: CONDUCT
 *               priority:
 *                 type: string
 *                 enum: [ROUTINE, HIGH, CRITICAL]
 *                 default: ROUTINE
 *                 example: HIGH
 *               description:
 *                 type: string
 *                 example: "Customer was disrespectful during the session."
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 */
router.post("/reports", authMiddleware, createReportHandler);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports (Admin only)
 *     tags:
 *       - Reports
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
 *         description: Reports fetched successfully
 */
router.get("/reports", authMiddleware, superadminMiddleware, getAllReportsHandler);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Get a report by ID (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report fetched successfully
 *       400:
 *         description: Report not found
 */
router.get("/reports/:id", authMiddleware, superadminMiddleware, getReportByIdHandler);

export default router;
