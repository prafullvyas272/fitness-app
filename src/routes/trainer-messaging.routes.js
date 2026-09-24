import express from "express";
import {
  getMentorConversationsHandler,
  getMessagesFromMentorHandler,
  sendMessageToMentorHandler,
} from "../controllers/trainer-messaging.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trainer/messages/mentors:
 *   get:
 *     summary: Get all mentor conversations for trainer
 *     tags:
 *       - Trainer Messaging
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentor conversations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           mentorId:
 *                             type: string
 *                           mentorName:
 *                             type: string
 *                           lastMessage:
 *                             type: string
 *                           lastMessageTime:
 *                             type: string
 *                           status:
 *                             type: string
 *                     total:
 *                       type: integer
 */
router.get("/mentors", authMiddleware, getMentorConversationsHandler);

/**
 * @swagger
 * /api/trainer/messages/mentor/{mentorId}:
 *   get:
 *     summary: Get all messages from a specific mentor
 *     tags:
 *       - Trainer Messaging
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: string
 *                     mentorId:
 *                       type: string
 *                     mentorName:
 *                       type: string
 *                     messages:
 *                       type: array
 *                     pagination:
 *                       type: object
 */
router.get("/mentor/:mentorId", authMiddleware, getMessagesFromMentorHandler);

/**
 * @swagger
 * /api/trainer/messages/mentor/{mentorId}/send:
 *   post:
 *     summary: Send message to mentor
 *     tags:
 *       - Trainer Messaging
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Hi mentor, I need your guidance"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.post("/mentor/:mentorId/send", authMiddleware, sendMessageToMentorHandler);

export default router;
