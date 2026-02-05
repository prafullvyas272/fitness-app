import { Router } from "express";
import { getUserAvailability } from "../controllers/user-availability.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { setUserAvailability } from "../controllers/user-availability.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { userAvailabilitySchema } from "../validators/user-availability.validation.js";

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


/**
 * @swagger
 * /api/user/availability:
 *   post:
 *     tags:
 *       - User Availability
 *     summary: Set a user's daily availability for a specific date
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for which to set availability (YYYY-MM-DD)
 *               isAvailable:
 *                 type: boolean
 *                 description: Whether the user is available on that date
 *               peakSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       example: "10:30"
 *                     end:
 *                       type: string
 *                       example: "12:00"
 *               alternativeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       example: "15:00"
 *                     end:
 *                       type: string
 *                       example: "17:00"
 *     responses:
 *       200:
 *         description: Availability for the date set successfully
 *       400:
 *         description: Missing or invalid fields
 */
router.post("/availability", authMiddleware, validate(userAvailabilitySchema), setUserAvailability);


export default router;
