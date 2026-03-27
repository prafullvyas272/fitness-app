import express from "express";
import { addQuestionaireHandler, updateQuestionaireByIdHandler, getCustomerQuestionaireHandler } from "../controllers/customer-questionaire.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/customer-questionaire:
 *   post:
 *     summary: Create a new Customer Questionaire
 *     tags:
 *       - CustomerQuestionaire
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: MongoDB ObjectId of the client
 *               clientName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               dateCompleted:
 *                 type: string
 *                 format: date
 *               heartCondition:
 *                 type: boolean
 *               chestPainDuringActivity:
 *                 type: boolean
 *               chestPainLastMonth:
 *                 type: boolean
 *               dizzinessOrLossOfConsciousness:
 *                 type: boolean
 *               boneOrJointProblem:
 *                 type: boolean
 *               bloodPressureMedication:
 *                 type: boolean
 *               otherReasonNotToExercise:
 *                 type: boolean
 *               pregnancyOrRecentBirth:
 *                 type: boolean
 *               chronicMedicalCondition:
 *                 type: boolean
 *               clientSignature:
 *                 type: string
 *               clientSignedDate:
 *                 type: string
 *                 format: date
 *               trainerName:
 *                 type: string
 *               trainerSignature:
 *                 type: string
 *               trainerSignedDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Customer questionaire created successfully
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
 *                   $ref: '#/components/schemas/CustomerQuestionaire'
 *       400:
 *         description: Error occurred during creation
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
  "/customer-questionaire",
  authMiddleware,
  addQuestionaireHandler
);

/**
 * @swagger
 * /api/customer-questionaire/{id}:
 *   put:
 *     summary: Update an existing Customer Questionaire by id
 *     tags:
 *       - CustomerQuestionaire
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the CustomerQuestionaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               dateCompleted:
 *                 type: string
 *                 format: date
 *               heartCondition:
 *                 type: boolean
 *               chestPainDuringActivity:
 *                 type: boolean
 *               chestPainLastMonth:
 *                 type: boolean
 *               dizzinessOrLossOfConsciousness:
 *                 type: boolean
 *               boneOrJointProblem:
 *                 type: boolean
 *               bloodPressureMedication:
 *                 type: boolean
 *               otherReasonNotToExercise:
 *                 type: boolean
 *               pregnancyOrRecentBirth:
 *                 type: boolean
 *               chronicMedicalCondition:
 *                 type: boolean
 *               clientSignature:
 *                 type: string
 *               clientSignedDate:
 *                 type: string
 *                 format: date
 *               trainerName:
 *                 type: string
 *               trainerSignature:
 *                 type: string
 *               trainerSignedDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Customer questionaire updated successfully
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
 *                   $ref: '#/components/schemas/CustomerQuestionaire'
 *       400:
 *         description: Error occurred during update
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
  "/customer-questionaire/:id",
  authMiddleware,
  updateQuestionaireByIdHandler
);


/**
 * @swagger
 * /api/customer-questionaire/{clientId}:
 *   get:
 *     summary: Get customer questionnaire by clientId (for trainer)
 *     tags:
 *       - Customer Questionaire
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer (client) user ID
 *     responses:
 *       200:
 *         description: Customer questionnaire fetched successfully.
 *       400:
 *         description: Failed to fetch questionnaire.
 */
router.get(
  "/customer-questionaire/:clientId",
  authMiddleware,
  getCustomerQuestionaireHandler
);

export default router;