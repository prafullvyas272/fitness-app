import express from "express";
import { getAllTrainersHandler } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trainers:
 *   get:
 *     summary: Get all trainers
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trainers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       specialities:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             specialityId:
 *                               type: integer
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
router.get("/trainers", authMiddleware, getAllTrainersHandler);

export default router;
