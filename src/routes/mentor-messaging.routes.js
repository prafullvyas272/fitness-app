import express from "express";
import {
  getConversationListHandler,
  getConversationMessagesHandler,
  sendMessageHandler,
  markMessagesAsReadHandler,
  getUnreadCountHandler,
} from "../controllers/mentor-messaging.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/mentor/messages/conversations:
 *   get:
 *     summary: Get all conversations for a mentor
 *     tags: [Mentor Messaging]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
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
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 */
router.get("/conversations", authMiddleware, getConversationListHandler);

/**
 * @swagger
 * /api/mentor/messages/conversations/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Mentor Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *       404:
 *         description: Conversation not found
 */
router.get("/conversations/:conversationId", authMiddleware, getConversationMessagesHandler);

/**
 * @swagger
 * /api/mentor/messages/send:
 *   post:
 *     summary: Send a message to a PT
 *     tags: [Mentor Messaging]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - ptId
 *               - message
 *             properties:
 *               conversationId:
 *                 type: string
 *               ptId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 */
router.post("/send", authMiddleware, sendMessageHandler);

/**
 * @swagger
 * /api/mentor/messages/mark-read:
 *   put:
 *     summary: Mark messages as read
 *     tags: [Mentor Messaging]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - messageIds
 *             properties:
 *               conversationId:
 *                 type: string
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put("/mark-read", authMiddleware, markMessagesAsReadHandler);

/**
 * @swagger
 * /api/mentor/messages/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Mentor Messaging]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 */
router.get("/unread-count", authMiddleware, getUnreadCountHandler);

export default router;
