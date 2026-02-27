import express from "express";
import {
  createSpecialityHandler,
  updateSpecialityHandler,
  deleteSpecialityHandler,
  listAllSpecialitiesHandler,
  getSpecialityByIdHandler
} from "../controllers/speciality.controller.js";
// Example auth middlewares, replace with actual implementations as appropriate for your app:
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";
import { specialitySchema } from "../validators/speciality.validation.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/specialities:
 *   post:
 *     summary: Create a new speciality
 *     tags:
 *       - Specialities
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cardiology
 *     responses:
 *       201:
 *         description: Speciality created successfully
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
 *                   $ref: '#/components/schemas/Speciality'
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
router.post(
  "/specialities",
  authMiddleware,
  superadminMiddleware,
  validate(specialitySchema),
  createSpecialityHandler
);

/**
 * @swagger
 * /api/specialities/{id}:
 *   put:
 *     summary: Update a speciality by ID
 *     tags:
 *       - Specialities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Speciality ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Oncology
 *     responses:
 *       200:
 *         description: Speciality updated successfully
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
 *                   $ref: '#/components/schemas/Speciality'
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
router.put(
  "/specialities/:id",
  authMiddleware,
  superadminMiddleware,
  validate(specialitySchema),
  updateSpecialityHandler
);

/**
 * @swagger
 * /api/specialities/{id}:
 *   delete:
 *     summary: Delete a speciality by ID
 *     tags:
 *       - Specialities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Speciality ID
 *     responses:
 *       200:
 *         description: Speciality deleted successfully
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
 *                   $ref: '#/components/schemas/Speciality'
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
router.delete(
  "/specialities/:id",
  authMiddleware,
  superadminMiddleware,
  deleteSpecialityHandler
);

/**
 * @swagger
 * /api/specialities:
 *   get:
 *     summary: List all specialities
 *     tags:
 *       - Specialities
 *     responses:
 *       200:
 *         description: Specialities fetched successfully
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
 *                     $ref: '#/components/schemas/Speciality'
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
router.get(
  "/specialities",
  listAllSpecialitiesHandler
);

/**
 * @swagger
 * /api/specialities/{id}:
 *   get:
 *     summary: Get a speciality by ID
 *     tags:
 *       - Specialities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Speciality ID
 *     responses:
 *       200:
 *         description: Speciality fetched successfully
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
 *                   $ref: '#/components/schemas/Speciality'
 *       404:
 *         description: Speciality not found
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
  "/specialities/:id",
  authMiddleware,
  getSpecialityByIdHandler
);

export default router;
