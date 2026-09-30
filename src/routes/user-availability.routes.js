import { Router } from "express";
import { getUserAvailability } from "../controllers/user-availability.controller.js";
import { getUserWeeklyAvailability } from "../controllers/user-availability.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { setUserAvailability } from "../controllers/user-availability.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { userAvailabilitySchema } from "../validators/user-availability.validation.js";
import { deleteAlternativeSlotHandler } from "../controllers/user-availability.controller.js";

const router = Router();

/**
 * @swagger
 * /api/user/availability:
 *   get:
 *     tags:
 *       - Trainer
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
router.get("/availability/weekly", authMiddleware, getUserWeeklyAvailability);


/**
 * @swagger
 * /api/user/availability:
 *   post:
 *     tags:
 *       - Trainer
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
 *                     timeSlotId:
 *                       type: string
 *                       example: "6996abf044e63e52f5d934dc"
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
 *                     timeSlotId:
 *                       type: string
 *                       example: "6996abf044e63e52f5d934dc"
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

/**
 * @swagger
 * /api/user/availability/alternative-slot/{timeSlotId}:
 *   delete:
 *     tags:
 *       - Trainer
 *     summary: Delete the trainer's own alternative slot
 *     description: Cannot delete a slot that is already booked.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeSlotId
 *         required: true
 *         schema: { type: string }
 *         description: The timeSlotId returned for this slot in alternativeSlots (GET /api/user/availability)
 *     responses:
 *       200:
 *         description: Alternative slot deleted successfully
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Not authorized, or slot is already booked
 *       404:
 *         description: Slot not found
 */
router.delete("/availability/alternative-slot/:timeSlotId", authMiddleware, deleteAlternativeSlotHandler);


export default router;
