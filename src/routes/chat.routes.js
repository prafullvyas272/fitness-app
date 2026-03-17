import express from "express";
import { 
  sendMessageHandler, 
  getConversationHandler, 
  getChatListHandler, 
  markMessagesAsReadHandler,
  createConversationHandler,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send a chat message
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *               receiverId:
 *                 type: string
 *               message:
 *                 type: string
 *                 description: Message text (optional for file uploads)
 *               type:
 *                 type: string
 *                 enum: [TEXT, IMAGE, VIDEO, FILE]
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Only required if type is IMAGE, VIDEO, or FILE
 *             required:
 *               - senderId
 *               - receiverId
 *               - type
 *     responses:
 *       200:
 *         description: Message sent
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
 *                   $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Error sending message
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
  "/chat/message",
  authMiddleware,
  upload.single('file'),
  sendMessageHandler
);

/**
 * @swagger
 * /api/chat/conversation/{conversationId}:
 *   get:
 *     summary: Get all messages in a conversation
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation fetched
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
 *                     $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Error fetching conversation
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
  "/chat/conversation/:conversationId",
  authMiddleware,
  getConversationHandler
);

/**
 * @swagger
 * /api/chat/list/{userId}:
 *   get:
 *     summary: Get chat list for a user
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Chat list fetched
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
 *                     $ref: '#/components/schemas/ChatConversation'
 *       400:
 *         description: Error fetching chat list
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
  "/chat/list/:userId",
  authMiddleware,
  getChatListHandler
);

/**
 * @swagger
 * /api/chat/mark-read:
 *   post:
 *     summary: Mark messages as read in a conversation for a user
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               userId:
 *                 type: string
 *             required:
 *               - conversationId
 *               - userId
 *     responses:
 *       200:
 *         description: Messages marked as read
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
 *                   type: "null"
 *       400:
 *         description: Error marking messages as read
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
  "/chat/mark-read",
  authMiddleware,
  markMessagesAsReadHandler
);


/**
 * @swagger
 * /api/chat/conversation:
 *   post:
 *     summary: Create a new chat conversation between a trainer and a customer
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainerId:
 *                 type: string
 *                 description: Trainer user ID
 *               customerId:
 *                 type: string
 *                 description: Customer user ID
 *             required:
 *               - trainerId
 *               - customerId
 *     responses:
 *       200:
 *         description: Conversation created or already exists
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
 *       400:
 *         description: Error creating conversation
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
  "/chat/conversation",
  authMiddleware,
  createConversationHandler
);

export default router;
