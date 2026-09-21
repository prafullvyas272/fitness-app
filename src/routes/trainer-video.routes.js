import express from "express";
import { addTrainerVideoHandler, getClientVideosHandler, getTrainerVideosHandler, assignVideoHandler, getAllTrainerVideosHandler, updateTrainerVideoHandler, deleteTrainerVideoHandler, getTrainerAndAdminVideosHandler } from "../controllers/trainer-video.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trainer-video/add:
 *   post:
 *     summary: Trainer assigns video to clients
 *     tags: [Trainer Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             title: Chest Workout
 *             description: Do daily
 *             type: link
 *             tags: chest,fitness
 *             videoLink: https://www.youtube.com/watch?v=abc123
 *             clientIds: ["clientId1"]
 *     responses:
 *       201:
 *         description: Video assigned successfully
 *       400:
 *         description: Bad request
 */
router.post("/add", authMiddleware, addTrainerVideoHandler);

router.get("/trainer", authMiddleware, getTrainerVideosHandler);

router.post("/assign", authMiddleware, assignVideoHandler);


/**
 * @swagger
 * /api/trainer-video/client:
 *   get:
 *     summary: Get videos assigned to logged-in client
 *     tags: [Trainer Videos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of videos
 *       500:
 *         description: Server error
 */
router.get("/client", authMiddleware, getClientVideosHandler);

router.get("/admin", authMiddleware, superadminMiddleware, getAllTrainerVideosHandler);

/**
 * @swagger
 * /api/trainer-video/all:
 *   get:
 *     summary: Get trainer uploaded and admin assigned videos with source marking
 *     description: Fetches all videos for a trainer - including videos uploaded by trainer and videos assigned by admin. Each video is marked with 'source' field (TRAINER or ADMIN).
 *     tags: [Trainer Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Videos fetched successfully with source marking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           tags:
 *                             type: array
 *                           source:
 *                             type: string
 *                             enum: [TRAINER, ADMIN]
 *                             description: Indicates if video was uploaded by trainer or assigned by admin
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Bad request
 */
router.get("/all", authMiddleware, getTrainerAndAdminVideosHandler);

router.put("/:videoId", authMiddleware, updateTrainerVideoHandler);

router.delete("/:videoId", authMiddleware, deleteTrainerVideoHandler);

export default router;
