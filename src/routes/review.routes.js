import express from "express";
import {
  createReviewHandler,
  updateReviewHandler,
  getAllReviewsHandler,
  deleteReviewHandler
} from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - type
 *             properties:
 *               trainerId:
 *                 type: string
 *                 description: Trainer's user ID (optional)
 *               customerId:
 *                 type: string
 *                 description: Customer's user ID (optional)
 *               rating:
 *                 type: integer
 *                 description: Rating score (e.g., 1-5)
 *               review:
 *                 type: string
 *                 description: The textual review
 *               type:
 *                 type: string
 *                 enum: [BUSINESS, TRAINER]
 *                 description: Type of the review
 *     responses:
 *       201:
 *         description: Review created successfully
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
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input or creation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/reviews",
  authMiddleware,
  createReviewHandler
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review by ID
 *     tags:
 *       - Reviews
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Review ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Updated rating score
 *               review:
 *                 type: string
 *                 description: Updated textual review
 *     responses:
 *       200:
 *         description: Review updated successfully
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
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/reviews/:id",
  authMiddleware,
  updateReviewHandler
);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews (filtered and paginated)
 *     tags:
 *       - Reviews
 *     parameters:
 *       - name: trainerId
 *         in: query
 *         description: Filter reviews by trainer ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: customerId
 *         in: query
 *         description: Filter reviews by customer ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         description: Filter reviews by review type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [BUSINESS, TRAINER]
 *       - name: skip
 *         in: query
 *         description: Number of records to skip (pagination)
 *         required: false
 *         schema:
 *           type: integer
 *       - name: take
 *         in: query
 *         description: Number of records to take/limit (pagination)
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retrieved reviews successfully
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
 *                     $ref: '#/components/schemas/Review'
 *       400:
 *         description: Error getting reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/reviews",
  authMiddleware,
  getAllReviewsHandler
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID
 *     tags:
 *       - Reviews
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Review ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Alternative way to provide identifiers (trainerId, customerId, type)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainerId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [BUSINESS, TRAINER]
 *     responses:
 *       200:
 *         description: Review deleted successfully
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
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Delete failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/reviews/:id",
  authMiddleware,
  deleteReviewHandler
);

export default router;