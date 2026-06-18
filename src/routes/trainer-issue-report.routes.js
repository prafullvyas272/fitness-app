import express from "express";
import {
  createTrainerIssueReportHandler,
  getMyTrainerIssueReportsHandler,
  getAllTrainerIssueReportsHandler,
  updateTrainerIssueReportStatusHandler,
} from "../controllers/trainer-issue-report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trainer/issue-reports:
 *   post:
 *     summary: Submit an app issue report (Trainer only)
 *     tags:
 *       - Trainer Issue Reports
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
 *                 example: "App crashes on booking screen"
 *               category:
 *                 type: string
 *                 enum: [BUG, FEATURE_REQUEST, PAYMENT, ACCOUNT, PERFORMANCE, OTHER]
 *                 example: BUG
 *               priority:
 *                 type: string
 *                 enum: [ROUTINE, HIGH, CRITICAL]
 *                 default: ROUTINE
 *                 example: HIGH
 *               description:
 *                 type: string
 *                 example: "The app crashes every time I open the booking screen."
 *     responses:
 *       201:
 *         description: Issue report submitted successfully
 *       400:
 *         description: Validation error
 */
router.post("/trainer/issue-reports", authMiddleware, createTrainerIssueReportHandler);

/**
 * @swagger
 * /api/trainer/issue-reports/me:
 *   get:
 *     summary: Get trainer's own issue reports with status updates
 *     tags:
 *       - Trainer Issue Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issue reports fetched successfully
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
router.get("/trainer/issue-reports/me", authMiddleware, getMyTrainerIssueReportsHandler);

/**
 * @swagger
 * /api/admin/trainer-issue-reports:
 *   get:
 *     summary: Get all trainer issue reports (Admin only)
 *     tags:
 *       - Trainer Issue Reports
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
 *           enum: [BUG, FEATURE_REQUEST, PAYMENT, ACCOUNT, PERFORMANCE, OTHER]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [ROUTINE, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: Trainer issue reports fetched successfully
 */
router.get("/admin/trainer-issue-reports", authMiddleware, superadminMiddleware, getAllTrainerIssueReportsHandler);

/**
 * @swagger
 * /api/admin/trainer-issue-reports/{id}:
 *   patch:
 *     summary: Update issue report status / add admin note (Admin only)
 *     tags:
 *       - Trainer Issue Reports
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
 *                 example: "We are looking into this issue."
 *     responses:
 *       200:
 *         description: Issue report updated successfully
 *       400:
 *         description: Error
 */
router.patch("/admin/trainer-issue-reports/:id", authMiddleware, superadminMiddleware, updateTrainerIssueReportStatusHandler);

export default router;
