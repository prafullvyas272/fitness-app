import express from "express";
import {
  createPlanHandler,
  updatePlanHandler,
  deletePlanHandler,
  listAllPlansHandler,
  getPlanByIdHandler,
} from "../controllers/plan.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Create a new plan
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - features
 *             properties:
 *               name:
 *                 type: string
 *                 example: Starter Plan
 *               price:
 *                 type: number
 *                 example: 15.99
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Feature 1", "Feature 2"]
 *               isPopular:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Plan created successfully
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
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Missing required fields or bad request
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
  "/plans",
  authMiddleware,
  superadminMiddleware,
  createPlanHandler
);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     summary: Update an existing plan
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Plan Name
 *               price:
 *                 type: number
 *                 example: 24.99
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Updated Feature 1", "Updated Feature 2"]
 *               isPopular:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Plan updated successfully
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
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Missing plan ID or bad request
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
  "/plans/:id",
  authMiddleware,
  superadminMiddleware,
  updatePlanHandler
);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     summary: Delete a plan by ID
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan deleted successfully
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
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Missing plan ID or bad request
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
router.delete(
  "/plans/:id",
  authMiddleware,
  superadminMiddleware,
  deletePlanHandler
);

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: List all plans
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plans fetched successfully
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
 *                     $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Error occurred while fetching plans
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
  "/plans",
  authMiddleware,
  listAllPlansHandler
);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Get a plan by ID
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan fetched successfully
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
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan not found
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
  "/plans/:id",
  authMiddleware,
  getPlanByIdHandler
);

export default router;