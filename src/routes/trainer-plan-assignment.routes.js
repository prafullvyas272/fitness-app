import express from "express";
import {
  assignPlanToTrainerHandler,
  getTrainerPlansHandler,
  removePlanFromTrainerHandler,
  updatePlanAssignmentHandler,
  assignMultiplePlansToTrainerHandler,
  removeAllPlansFromTrainerHandler,
} from "../controllers/trainer-plan-assignment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trainer-plans:
 *   post:
 *     summary: Assign a plan to a trainer
 *     tags: [Trainer Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trainerId
 *               - planId
 *             properties:
 *               trainerId:
 *                 type: string
 *               planId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plan assigned to trainer
 *       400:
 *         description: Invalid request
 */
router.post("/", authMiddleware, superadminMiddleware, assignPlanToTrainerHandler);

/**
 * @swagger
 * /api/trainer-plans/assign-multiple:
 *   post:
 *     summary: Assign multiple plans to a trainer (weekly, monthly, quarterly, yearly)
 *     tags: [Trainer Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trainerId
 *               - planIds
 *             properties:
 *               trainerId:
 *                 type: string
 *               planIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["planId1", "planId2", "planId3"]
 *     responses:
 *       201:
 *         description: Multiple plans assigned successfully
 *       400:
 *         description: Invalid request
 */
router.post("/assign-multiple", authMiddleware, superadminMiddleware, assignMultiplePlansToTrainerHandler);

/**
 * @swagger
 * /api/trainer-plans/{trainerId}:
 *   get:
 *     summary: Get all plans assigned to a trainer
 *     tags: [Trainer Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Trainer plans fetched
 *       400:
 *         description: Trainer not found
 */
router.get("/:trainerId", authMiddleware, getTrainerPlansHandler);

/**
 * @swagger
 * /api/trainer-plans/{trainerId}/{planId}:
 *   put:
 *     summary: Update plan assignment status
 *     tags: [Trainer Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: planId
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan assignment updated
 *       400:
 *         description: Invalid request
 */
router.put("/:trainerId/:planId", authMiddleware, superadminMiddleware, updatePlanAssignmentHandler);

/**
 * @swagger
 * /api/trainer-plans/{trainerId}/{planId}:
 *   delete:
 *     summary: Remove a plan from a trainer
 *     tags: [Trainer Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan removed
 *       400:
 *         description: Assignment not found
 */
router.delete("/:trainerId/:planId", authMiddleware, superadminMiddleware, removePlanFromTrainerHandler);

/**
 * @swagger
 * /api/trainer-plans/{trainerId}/all:
 *   delete:
 *     summary: Remove all plans from a trainer
 *     tags: [Trainer Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All plans removed
 *       400:
 *         description: Trainer not found
 */
router.delete("/:trainerId/all", authMiddleware, superadminMiddleware, removeAllPlansFromTrainerHandler);

export default router;
