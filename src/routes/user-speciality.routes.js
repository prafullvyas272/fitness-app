import { Router } from "express";
import {
  updateSpecialities,
  getSpecialities,
} from "../controllers/user-speciality.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/user/specialities:
 *   post:
 *     tags:
 *       - Trainer
 *     summary: Update user specialities (external IDs)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialityIds
 *             properties:
 *               specialityIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Specialities updated successfully
 */
router.post("/specialities", authMiddleware, updateSpecialities);

/**
 * @swagger
 * /api/user/specialities:
 *   get:
 *     tags:
 *       - Trainer
 *     summary: Get user specialities
 *     responses:
 *       200:
 *         description: List of speciality IDs
 */
router.get("/specialities", getSpecialities);

export default router;
