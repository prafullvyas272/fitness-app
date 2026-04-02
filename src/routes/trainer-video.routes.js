import express from "express";
import { addTrainerVideoHandler, getClientVideosHandler, getTrainerVideosHandler, assignVideoHandler, getAllTrainerVideosHandler } from "../controllers/trainer-video.controller.js";
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


export default router;