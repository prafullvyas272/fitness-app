import express from "express";
import { addJournalEntryForDateHandler, getJournalEntryByDateHandler, getAllJournalEntriesHandler } from "../controllers/journal-entry.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload, videoUpload } from "../middlewares/upload.middleware.js";

/**
 * @swagger
 * /api/journal-entries:
 *   post:
 *     summary: Add or update a journal entry for a specific date
 *     description: Add a new journal entry or update an existing one for a user on a specific date. Accepts media files and wellness metrics.
 *     tags:
 *       - JournalEntry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (optional)
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload (optional)
 *               note:
 *                 type: string
 *                 description: Note for the entry
 *               isPrivate:
 *                 type: boolean
 *                 description: Whether the entry is private
 *               energy:
 *                 type: integer
 *                 description: Energy score
 *               physicalReadiness:
 *                 type: integer
 *                 description: Physical readiness score
 *               motivation:
 *                 type: integer
 *                 description: Motivation score
 *               stressLevel:
 *                 type: integer
 *                 description: Stress level score
 *               mentalFitness:
 *                 type: integer
 *                 description: Mental fitness score
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for the entry (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Journal entry added or updated successfully
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
 *                   $ref: '#/components/schemas/JournalEntry'
 *       400:
 *         description: Error adding or updating journal entry
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
const router = express.Router();

router.post(
  "/journal-entries",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  addJournalEntryForDateHandler
);

/**
 * @swagger
 * /api/journal-entries/by-date:
 *   get:
 *     summary: Retrieve a journal entry for a specific date
 *     description: Get a journal entry for a user by date.
 *     tags:
 *       - JournalEntry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to retrieve (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Journal entry retrieved successfully or not found
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
 *                   $ref: '#/components/schemas/JournalEntry'
 *       400:
 *         description: Error fetching journal entry
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
  "/journal-entries/by-date",
  authMiddleware,
  getJournalEntryByDateHandler
);

// journal.routes.js
router.get("/journal", getAllJournalEntriesHandler);              // GET 


export default router;