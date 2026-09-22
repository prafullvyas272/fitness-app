import express from "express";
import { addTrainerVideoHandler, getClientVideosHandler, getTrainerVideosHandler, assignVideoHandler, getAllTrainerVideosHandler, updateTrainerVideoHandler, deleteTrainerVideoHandler, getTrainerAndAdminVideosHandler, getAssignedVideosHandler, getUnassignedVideosHandler, getAllVideosWithStatusHandler, unassignVideoHandler, unassignVideoFromAllHandler } from "../controllers/trainer-video.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";
import { videoUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trainer-video/add:
 *   post:
 *     summary: Trainer uploads video (file or link)
 *     description: Upload a video as a file or provide a video link. Support both multipart/form-data for file uploads and application/json for links.
 *     tags: [Trainer Videos]
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: Chest Workout
 *               description:
 *                 type: string
 *                 example: Complete chest routine
 *               tags:
 *                 type: string
 *                 example: chest,fitness
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (mp4, avi, mkv, mov, webm, etc.) - Use this OR videoLink
 *               videoLink:
 *                 type: string
 *                 example: https://www.youtube.com/watch?v=abc123
 *                 description: Video URL (YouTube, Vimeo, etc.) - Use this OR video file
 *         application/json:
 *           example:
 *             title: Chest Workout
 *             description: Do daily
 *             tags: chest,fitness
 *             videoLink: https://www.youtube.com/watch?v=abc123
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - provide either video file or videoLink
 */
router.post("/add", authMiddleware, videoUpload.single("video"), addTrainerVideoHandler);

router.get("/trainer", authMiddleware, getTrainerVideosHandler);

router.post("/assign", authMiddleware, assignVideoHandler);

/**
 * @swagger
 * /api/trainer-video/unassign:
 *   post:
 *     summary: Unassign video from specific clients
 *     description: Trainer can remove video assignments from specific customers
 *     tags: [Trainer Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoId
 *               - clientIds
 *             properties:
 *               videoId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["customerId1", "customerId2"]
 *           example:
 *             videoId: "video_id"
 *             clientIds: ["client1", "client2"]
 *     responses:
 *       200:
 *         description: Video unassigned from clients successfully
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
 *                     videoId:
 *                       type: string
 *                     unassignedFromCount:
 *                       type: integer
 *                     unassignedFromClients:
 *                       type: array
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized - video not owned by trainer
 *       404:
 *         description: Video not found
 */
router.post("/unassign", authMiddleware, unassignVideoHandler);

/**
 * @swagger
 * /api/trainer-video/unassign-all:
 *   post:
 *     summary: Unassign video from ALL clients
 *     description: Trainer can remove video assignment from all customers at once
 *     tags: [Trainer Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoId
 *             properties:
 *               videoId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *           example:
 *             videoId: "video_id"
 *     responses:
 *       200:
 *         description: Video unassigned from all clients successfully
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
 *                     videoId:
 *                       type: string
 *                     unassignedFromCount:
 *                       type: integer
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Video not found
 */
router.post("/unassign-all", authMiddleware, unassignVideoFromAllHandler);


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

/**
 * @swagger
 * /api/trainer-video/assigned:
 *   get:
 *     summary: Get videos assigned to a specific customer
 *     description: Trainer can view videos they have assigned to a particular customer
 *     tags: [Trainer Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer/Client ID to see assigned videos for
 *     responses:
 *       200:
 *         description: Assigned videos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                           videoLink:
 *                             type: string
 *                           isAssigned:
 *                             type: boolean
 *                             example: true
 *                           assignedToClientId:
 *                             type: string
 *                           assignedAt:
 *                             type: string
 *                             format: date-time
 */
router.get("/assigned", authMiddleware, getAssignedVideosHandler);

/**
 * @swagger
 * /api/trainer-video/unassigned:
 *   get:
 *     summary: Get unassigned videos (not assigned to a specific customer or anyone)
 *     description: |
 *       Trainer can view unassigned videos to select and assign to customers.
 *       - With customerId: Shows videos not yet assigned to that specific customer
 *       - Without customerId: Shows all videos not assigned to anyone
 *     tags: [Trainer Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: (Optional) Show videos not assigned to this specific customer. If omitted, shows all unassigned videos.
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
 *         description: Unassigned videos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                           videoLink:
 *                             type: string
 *                           isAssigned:
 *                             type: boolean
 *                             example: false
 *                           availableForCustomerId:
 *                             type: string
 *                             nullable: true
 *                     filterInfo:
 *                       type: object
 *                       properties:
 *                         customerId:
 *                           type: string
 *                           nullable: true
 *                         filterType:
 *                           type: string
 *                           enum: ["unassigned-for-customer", "all-unassigned"]
 *                     pagination:
 *                       type: object
 */
router.get("/unassigned", authMiddleware, getUnassignedVideosHandler);

/**
 * @swagger
 * /api/trainer-video/status:
 *   get:
 *     summary: Get all trainer videos with assignment status and assigned customer info
 *     description: Shows all videos with flags indicating if assigned and to whom
 *     tags: [Trainer Videos]
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
 *     responses:
 *       200:
 *         description: All videos with status fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                           isAssigned:
 *                             type: boolean
 *                           assignedTo:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 clientId:
 *                                   type: string
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 assignedAt:
 *                                   type: string
 */
router.get("/status", authMiddleware, getAllVideosWithStatusHandler);

router.put("/:videoId", authMiddleware, updateTrainerVideoHandler);

router.delete("/:videoId", authMiddleware, deleteTrainerVideoHandler);

export default router;
