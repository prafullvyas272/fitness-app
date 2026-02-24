import express from "express";
import { uploadWorkoutVideoHandler, getAllWorkoutVideosHandler, getWorkoutVideoByIdHandler, deleteWorkoutVideoHandler, updateWorkoutVideoHandler, getAllWorkoutVideoTagsHandler } from "../controllers/workout-video.controller.js";
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
 *                 example: Chest Workout Part 1
 *               description:
 *                 type: string
 *                 description: Description of the workout video
 *                 example: A chest workout for beginners
 *               tags:
 *                 type: array
 *                 description: Array of tag strings
 *                 items:
 *                   type: string
 *                 example:
 *                   - chest
 *                   - beginner
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


/**
 * @swagger
 * /api/workout-videos:
 *   get:
 *     summary: Get all workout videos
 *     tags:
 *       - Workout Videos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout videos fetched successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       status:
 *                         type: string
 *                       uploadedBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Failed to fetch workout videos
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
router.get(
  "/workout-videos",
  authMiddleware,
  superadminMiddleware,
  getAllWorkoutVideosHandler
);

/**
 * @swagger
 * /api/workout-videos/{id}:
 *   get:
 *     summary: Get workout video by ID
 *     tags:
 *       - Workout Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Workout video ID
 *     responses:
 *       200:
 *         description: Workout video fetched successfully
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
 *       404:
 *         description: Workout video not found
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
router.get(
  "/workout-videos/:id",
  authMiddleware,
  superadminMiddleware,
  getWorkoutVideoByIdHandler
);

/**
 * @swagger
 * /api/workout-videos/{id}:
 *   put:
 *     summary: Update a workout video
 *     tags:
 *       - Workout Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Workout video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Workout video updated successfully
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
 *         description: Failed to update workout video
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
router.put(
  "/workout-videos/:id",
  authMiddleware,
  superadminMiddleware,
  updateWorkoutVideoHandler
);

/**
 * @swagger
 * /api/workout-videos/{id}:
 *   delete:
 *     summary: Delete a workout video
 *     tags:
 *       - Workout Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Workout video ID
 *     responses:
 *       200:
 *         description: Workout video deleted successfully
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
 *       404:
 *         description: Workout video not found
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
router.delete(
  "/workout-videos/:id",
  authMiddleware,
  superadminMiddleware,
  deleteWorkoutVideoHandler
);


/**
 * @swagger
 * /api/workout-videos-tags:
 *   get:
 *     summary: Get all distinct tags used in workout videos
 *     tags:
 *       - Workout Videos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout video tags fetched successfully
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
 *                   type: array
 *                   items:
 *                     type: string
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
router.get(
  "/workout-videos-tags",
  authMiddleware,
  getAllWorkoutVideoTagsHandler
);

export default router;