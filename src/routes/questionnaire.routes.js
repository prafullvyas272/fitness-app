import { Router } from "express";
import { addQuestionnaireDetailsForClientHandler } from "../controllers/questionnaire.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/questionnaire:
 *   post:
 *     summary: Add or update questionnaire details for a client (user)
 *     tags:
 *       - Questionnaire
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - clientName
 *               - age
 *               - heightCm
 *               - weightKg
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User (client) ID
 *               clientName:
 *                 type: string
 *               age:
 *                 type: integer
 *               heightCm:
 *                 type: integer
 *               weightKg:
 *                 type: number
 *               dietaryRestrictions:
 *                 type: string
 *               goals:
 *                 type: string
 *               medicalHistory:
 *                 type: string
 *               exerciseExperience:
 *                 type: string
 *               availability:
 *                 type: string
 *               trainingPreferences:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Questionnaire details updated successfully.
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
 *       400:
 *         description: Failed to add/update questionnaire details.
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
  "/questionnaire",
  authMiddleware,
  addQuestionnaireDetailsForClientHandler
);

export default router;