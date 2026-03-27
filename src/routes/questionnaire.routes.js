import { Router } from "express";
import { addQuestionnaireDetailsForClientHandler, updateQuestionnaireNotesHandler, getQuestionnaireByUserIdHandler } from "../controllers/questionnaire.controller.js";
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



/**
 * @swagger
 * /api/questionnaire/notes:
 *   patch:
 *     summary: Update only the notes field of a questionnaire by user ID
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
 *               - notes
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID whose questionnaire notes will be updated
 *               notes:
 *                 type: string
 *                 description: The new notes text
 *     responses:
 *       200:
 *         description: Questionnaire notes updated successfully.
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
 *         description: Failed to update questionnaire notes.
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
router.patch(
  "/questionnaire/notes",
  authMiddleware,
  updateQuestionnaireNotesHandler
);

/**
 * @swagger
 * /api/questionnaire/{userId}:
 *   get:
 *     summary: Get questionnaire details by userId
 *     tags:
 *       - Questionnaire
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Questionnaire fetched successfully.
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
 *         description: Failed to fetch questionnaire.
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
  "/questionnaire/:userId", // ✅ FIXED SPELLING
  authMiddleware,
  getQuestionnaireByUserIdHandler
);

export default router;