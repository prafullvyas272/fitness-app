import { Router } from "express";
import { getUserAvailability } from "../controllers/user-availability.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/user/availability:
 *   get:
 *     tags:
 *       - User Availability
 *     summary: Get a user's daily availability for a specific date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date for which to fetch availability (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Availability data
 *       400:
 *         description: Missing or invalid parameters
 *       404:
 *         description: No availability found for this date
 */
router.get("/availability", authMiddleware, getUserAvailability);

export default router;
