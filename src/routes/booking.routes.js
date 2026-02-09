import express from "express";
import { getBookingsByTrainerHandler, bookSlotHandler, markAsAttendedHandler } from "../controllers/booking.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * /api/trainers/{trainerId}/bookings:
 *   get:
 *     summary: Get paginated bookings for a specific trainer
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID for which to list bookings
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Bookings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bookings fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           customer:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           timeSlot:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                               startTime:
 *                                 type: string
 *                                 format: date-time
 *                               endTime:
 *                                 type: string
 *                                 format: date-time
 *                               slotType:
 *                                 type: string
 *                               durationMinutes:
 *                                 type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error message
 */
const router = express.Router();
router.get(
  "/trainers/:trainerId/bookings",
  authMiddleware,
  getBookingsByTrainerHandler
);

/**
 * @swagger
 * /api/trainers/{trainerId}/book:
 *   post:
 *     summary: Book a time slot with a trainer (customer only)
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the trainer to book with
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeSlotId:
 *                 type: string
 *                 description: ID of the time slot to book
 *     responses:
 *       201:
 *         description: Slot booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Slot booked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     trainerId:
 *                       type: string
 *                     timeSlotId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error message
 */
router.post(
  "/trainers/:trainerId/book",
  authMiddleware,
  bookSlotHandler
);


/**
 * @swagger
 * /api/bookings/{bookingId}/attend:
 *   post:
 *     summary: Mark a trainer booking as attended
 *     tags:
 *       - Booking
 *       - Customer
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID to mark as attended
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAttended:
 *                 type: boolean
 *                 description: Whether the booking was attended (true/false)
 *             required:
 *               - isAttended
 *     responses:
 *       200:
 *         description: Booking marked as attended
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking marked as attended
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error message
 */
router.post(
  "/bookings/:bookingId/attend",
  authMiddleware,
  markAsAttendedHandler
);

export default router;
