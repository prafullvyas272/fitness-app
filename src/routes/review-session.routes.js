import express from "express";
import {
  createSessionReviewHandler,
  getSessionReviewsByTrainerHandler,
  getSessionReviewByBookingHandler,
  updateSessionReviewHandler,
  deleteSessionReviewHandler
} from "../controllers/review-session.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/session-reviews:
 *   post:
 *     summary: Submit a review for a completed session
 *     tags:
 *       - Session Reviews
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - trainerId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *               trainerId:
 *                 type: string
 *                 example: "69bce853116052a244abba4f"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Great session! Very professional trainer."
 *     responses:
 *       201:
 *         description: Review submitted successfully
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
 */
router.post("/", authMiddleware, createSessionReviewHandler);

/**
 * @swagger
 * /api/session-reviews/trainer/{trainerId}:
 *   get:
 *     summary: Get all reviews for a trainer
 *     tags:
 *       - Session Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Reviews fetched successfully
 */
router.get("/trainer/:trainerId", authMiddleware, getSessionReviewsByTrainerHandler);

/**
 * @swagger
 * /api/session-reviews/booking/{bookingId}:
 *   get:
 *     summary: Get review for a specific booking
 *     tags:
 *       - Session Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review fetched successfully
 */
router.get("/booking/:bookingId", authMiddleware, getSessionReviewByBookingHandler);

/**
 * @swagger
 * /api/session-reviews/{bookingId}:
 *   put:
 *     summary: Update a review
 *     tags:
 *       - Session Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 */
router.put("/:bookingId", authMiddleware, updateSessionReviewHandler);

/**
 * @swagger
 * /api/session-reviews/{bookingId}:
 *   delete:
 *     summary: Delete a review
 *     tags:
 *       - Session Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
router.delete("/:bookingId", authMiddleware, deleteSessionReviewHandler);

export default router;
