import express from "express";
import {
  getAllMentorsHandler,
  getMentorByIdHandler,
  getMentorStatsHandler
} from "../controllers/admin-mentor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/mentors:
 *   get:
 *     summary: Get all mentors
 *     tags: [Admin Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Mentors fetched successfully
 */
router.get("/", authMiddleware, getAllMentorsHandler);

/**
 * @swagger
 * /api/admin/mentors/stats:
 *   get:
 *     summary: Get mentor statistics
 *     tags: [Admin Mentors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 */
router.get("/stats", authMiddleware, getMentorStatsHandler);

/**
 * @swagger
 * /api/admin/mentors/{mentorId}:
 *   get:
 *     summary: Get mentor details
 *     tags: [Admin Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mentor fetched successfully
 *       404:
 *         description: Mentor not found
 */
router.get("/:mentorId", authMiddleware, getMentorByIdHandler);

export default router;
