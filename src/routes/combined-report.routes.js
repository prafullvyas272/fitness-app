import express from "express";
import {
  getAllReportsForAdminHandler,
  getAllReportsForMentorHandler,
  resolveReportForMentorHandler,
} from "../controllers/combined-report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();
const mentorRouter = express.Router();

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

/**
 * @swagger
 * /api/mentor/all-reports:
 *   get:
 *     summary: (Mentor) Get all reports for trainers assigned to the logged-in mentor - customers reporting trainers and trainers reporting customers
 *     tags: [Mentor Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trainerId
 *         schema:
 *           type: string
 *         description: Optional - filter to one specific assigned trainer
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [CUSTOMER_REPORTED_TRAINER, TRAINER_REPORTED_CUSTOMER]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RESOLVED, REJECTED]
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
mentorRouter.get("/all-reports", authMiddleware, getAllReportsForMentorHandler);

/**
 * @swagger
 * /api/mentor/all-reports/{reportId}/resolve:
 *   put:
 *     summary: (Mentor) Mark a report as resolved - for a trainer assigned to the logged-in mentor
 *     tags: [Mentor Reports]
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
 *               - reportType
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [CUSTOMER_REPORTED_TRAINER, TRAINER_REPORTED_CUSTOMER]
 *     responses:
 *       200:
 *         description: Report marked as resolved
 */
mentorRouter.put("/all-reports/:reportId/resolve", authMiddleware, resolveReportForMentorHandler);

export { mentorRouter };
export default router;
