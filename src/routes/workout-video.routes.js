import express from "express";
import { uploadWorkoutVideoHandler } from "../controllers/workout-video.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { videoUpload } from "../middlewares/upload.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/workout-videos:
 *   post:
 *     summary: Upload a new workout video
 *     tags:
 *       - Workout Videos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the workout video
 *                 example: "Chest Workout Part 1"
 *               description:
 *                 type: string
 *                 description: Description of the workout video
 *                 example: "A chest workout for beginners"
 *               tags:
 *                 type: array
 *                 description: Tags for video categorization
 *                 items:
 *                   type: string
 *                 example: ["chest", "beginner"]
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload
 *     responses:
 *       200:
 *         description: Video upload started
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
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     status:
 *                       type: string
 *                     uploadedBy:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  "/workout-videos",
  authMiddleware,
  superadminMiddleware,
  videoUpload.single("video"),
  uploadWorkoutVideoHandler
);

export default router;