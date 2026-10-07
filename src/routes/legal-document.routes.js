import express from "express";
import {
  upsertLegalDocumentHandler,
  getAllLegalDocumentsForAdminHandler,
  getPublicLegalDocumentHandler,
} from "../controllers/legal-document.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/legal-documents:
 *   post:
 *     summary: (Admin) Create or update the privacy policy / terms & conditions for a given audience
 *     tags: [Legal Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audience
 *               - type
 *               - content
 *             properties:
 *               audience:
 *                 type: string
 *                 enum: [CUSTOMER, TRAINER]
 *               type:
 *                 type: string
 *                 enum: [PRIVACY_POLICY, TERMS_AND_CONDITIONS]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document saved successfully
 */
router.post("/", authMiddleware, superadminMiddleware, upsertLegalDocumentHandler);

/**
 * @swagger
 * /api/legal-documents:
 *   get:
 *     summary: (Admin) Get all privacy policy / terms & conditions documents
 *     tags: [Legal Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: audience
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, TRAINER]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PRIVACY_POLICY, TERMS_AND_CONDITIONS]
 *     responses:
 *       200:
 *         description: Documents fetched successfully
 */
router.get("/", authMiddleware, superadminMiddleware, getAllLegalDocumentsForAdminHandler);

/**
 * @swagger
 * /api/legal-documents/public/{audience}/{type}:
 *   get:
 *     summary: Public - get the privacy policy or terms & conditions for an audience, no access token required
 *     tags: [Legal Documents]
 *     parameters:
 *       - in: path
 *         name: audience
 *         required: true
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, TRAINER]
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PRIVACY_POLICY, TERMS_AND_CONDITIONS]
 *     responses:
 *       200:
 *         description: Document fetched successfully
 *       404:
 *         description: This document has not been published yet
 */
router.get("/public/:audience/:type", getPublicLegalDocumentHandler);

export default router;
