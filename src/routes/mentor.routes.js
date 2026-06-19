import express from "express";
import {
  createMentorHandler,
  getAllMentorsHandler,
  getMentorByIdHandler,
  updateMentorHandler,
  deleteMentorHandler,
  getUnassignedTrainersHandler,
  assignTrainersHandler,
  unassignTrainerHandler,
} from "../controllers/mentor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/mentors:
 *   post:
 *     summary: Create a new mentor (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Sarah
 *               lastName:
 *                 type: string
 *                 example: Connor
 *               email:
 *                 type: string
 *                 example: sarah@example.com
 *               password:
 *                 type: string
 *                 example: Strong@123
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               title:
 *                 type: string
 *                 example: "Senior Trainer Success Manager"
 *               experience:
 *                 type: integer
 *                 example: 5
 *               region:
 *                 type: string
 *                 example: "North America"
 *               maxPTs:
 *                 type: integer
 *                 example: 30
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *               specialityIds:
 *                 type: string
 *                 description: JSON array of speciality IDs
 *                 example: '["id1","id2"]'
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Mentor created successfully
 *       400:
 *         description: Error
 */
router.post(
  "/mentors",
  authMiddleware,
  superadminMiddleware,
  upload.single("profilePhoto"),
  createMentorHandler
);

/**
 * @swagger
 * /api/mentors:
 *   get:
 *     summary: Get all mentors (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Mentors fetched successfully
 */
router.get("/mentors", authMiddleware, superadminMiddleware, getAllMentorsHandler);

/**
 * @swagger
 * /api/mentors/{id}:
 *   get:
 *     summary: Get a mentor by ID (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mentor fetched successfully
 */
router.get("/mentors/:id", authMiddleware, superadminMiddleware, getMentorByIdHandler);

/**
 * @swagger
 * /api/mentors/{id}:
 *   put:
 *     summary: Update a mentor (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               title: { type: string }
 *               experience: { type: integer }
 *               region: { type: string }
 *               maxPTs: { type: integer }
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               specialityIds:
 *                 type: string
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Mentor updated successfully
 */
router.put(
  "/mentors/:id",
  authMiddleware,
  superadminMiddleware,
  upload.single("profilePhoto"),
  updateMentorHandler
);

/**
 * @swagger
 * /api/mentors/{id}:
 *   delete:
 *     summary: Delete a mentor (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mentor deleted successfully
 */
router.delete("/mentors/:id", authMiddleware, superadminMiddleware, deleteMentorHandler);

/**
 * @swagger
 * /api/mentors/trainers/unassigned:
 *   get:
 *     summary: Get all trainers not yet assigned to any mentor (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unassigned trainers fetched successfully
 */
router.get("/mentors/trainers/unassigned", authMiddleware, superadminMiddleware, getUnassignedTrainersHandler);

/**
 * @swagger
 * /api/mentors/{id}/assign-trainers:
 *   post:
 *     summary: Assign one or more trainers to a mentor (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trainerIds]
 *             properties:
 *               trainerIds:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["trainerId1", "trainerId2"]
 *     responses:
 *       200:
 *         description: Trainer(s) assigned successfully
 */
router.post("/mentors/:id/assign-trainers", authMiddleware, superadminMiddleware, assignTrainersHandler);

/**
 * @swagger
 * /api/mentors/{id}/unassign-trainer/{trainerId}:
 *   delete:
 *     summary: Unassign a trainer from a mentor (Admin only)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trainer unassigned successfully
 */
router.delete("/mentors/:id/unassign-trainer/:trainerId", authMiddleware, superadminMiddleware, unassignTrainerHandler);

export default router;
