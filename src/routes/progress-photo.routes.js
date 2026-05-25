import express from "express";
import { uploadProgressPhotoHandler, getProgressPhotosHandler } from "../controllers/progress-photo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/progress-photos:
 *   post:
 *     summary: Upload a progress photo
 *     description: Customer uploads a single progress photo with a type (BEFORE, DURING, AFTER, CHECK_IN).
 *     tags:
 *       - Progress Photos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - photo
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [BEFORE, DURING, AFTER, CHECK_IN]
 *                 example: BEFORE
 *               photo:
 *                 type: string
 *                 format: binary
 *               takenAt:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *                 description: Optional date the photo was taken (defaults to now)
 *     responses:
 *       201:
 *         description: Progress photo uploaded successfully
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
 *                     type:
 *                       type: string
 *                     photoUrl:
 *                       type: string
 *                     takenAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  authMiddleware,
  upload.single("photo"),
  uploadProgressPhotoHandler
);

/**
 * @swagger
 * /api/progress-photos:
 *   get:
 *     summary: Get all progress photos for the logged-in customer
 *     description: Returns a flat list and a grouped-by-type object of all progress photos.
 *     tags:
 *       - Progress Photos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress photos fetched successfully
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
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           photoUrl:
 *                             type: string
 *                           takenAt:
 *                             type: string
 *                             format: date-time
 *                     grouped:
 *                       type: object
 *                       properties:
 *                         BEFORE:
 *                           type: array
 *                         DURING:
 *                           type: array
 *                         AFTER:
 *                           type: array
 *                         CHECK_IN:
 *                           type: array
 *       400:
 *         description: Bad request
 */
router.get(
  "/",
  authMiddleware,
  getProgressPhotosHandler
);

export default router;
