import express from "express";
import {
  getCancelledSessionsForAdminHandler,
  getCancelledSessionsForMentorHandler,
} from "../controllers/cancelled-session.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/cancelled-sessions/admin:
 *   get:
 *     summary: (Admin) Get all cancelled sessions across trainers
 *     tags: [Cancelled Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trainerId
 *         schema:
 *           type: string
 *         description: Optional - filter to one specific trainer
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
 *         description: Cancelled sessions fetched successfully
 */
router.get("/admin", authMiddleware, superadminMiddleware, getCancelledSessionsForAdminHandler);

/**
 * @swagger
 * /api/cancelled-sessions/mentor/me:
 *   get:
 *     summary: (Mentor) Get cancelled sessions for trainers assigned to the logged-in mentor
 *     tags: [Cancelled Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trainerId
 *         schema:
 *           type: string
 *         description: Optional - filter to one specific assigned trainer
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
 *         description: Cancelled sessions fetched successfully
 */
router.get("/mentor/me", authMiddleware, getCancelledSessionsForMentorHandler);

export default router;
