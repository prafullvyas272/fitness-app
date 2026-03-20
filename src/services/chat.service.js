import prisma from "../utils/prisma.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { sendChatNotification } from "./notification.service.js";
import { pusher } from "../utils/pusher.js";


/**
 * Send a chat message and upsert conversation.
 * Handles image/file upload if provided, saving the URL.
 * @param {Object} data - Message data (may include file/image Buffer and mimetype)
 * @returns {Promise<Object>} Created ChatMessage
 */
export const sendMessage = async (data) => {
  const { senderId, receiverId, message, type, file } = data;
  try {
    // Always generate the conversationId based on sender and receiver IDs lexicographically
    const conversationId =
      senderId < receiverId
        ? `${senderId}_${receiverId}`
        : `${receiverId}_${senderId}`;

    let mediaUrl = null;
    console.log(file , type)

    // If type is IMAGE or FILE or VIDEO, upload to Cloudinary and use resulting URL
    if (file && (type === "IMAGE" || type === "FILE" || type === "VIDEO")) {
      // Determine resource_type for Cloudinary
      let resourceType = "auto";
      if (type === "IMAGE") resourceType = "image";
      if (type === "VIDEO") resourceType = "video";
      if (type === "FILE") resourceType = "raw";
      const uploadResult = await uploadToCloudinary(file, resourceType);
      mediaUrl = uploadResult?.secure_url || uploadResult?.url || null;
    }

    // Upsert (create or update) the conversation
    const conversation = await prisma.chatConversation.upsert({
      where: { conversationId },
      create: {
        conversationId,
        trainerId: senderId, // TODO: assign properly if needed
        customerId: receiverId,
        lastMessage: message || (mediaUrl ? `[${type}]` : ""),
        lastMessageTime: new Date(),
      },
      update: {
        lastMessage: message || (mediaUrl ? `[${type}]` : ""),
        lastMessageTime: new Date(),
      },
    });

    // Create the chat message within the conversation
    const chatMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        message: message || null,
        type,
        fileUrl: mediaUrl,
      },
    });

    await sendChatNotification(receiverId, message);

    await pusher.trigger(
      `chat-${conversationId}`,   // channel
      "new-message",              // event name
      chatMessage                // data
    );

    return chatMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

/**
 * Get all messages for a conversation.
 * @param {String} conversationId 
 * @returns {Promise<Array>} Messages ordered by createdAt
 */
export const getConversation = async (conversationId) => {
  try {
    // Split the conversationId by underscore to extract the two user IDs
    const [userOne, userTwo] = conversationId.split("_");
    if (!userOne || !userTwo) {
      throw new Error("Invalid conversationId format");
    }

    // Find the conversation where:
    // (trainerId = userOne AND customerId = userTwo)
    //   OR
    // (trainerId = userTwo AND customerId = userOne)
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        OR: [
          { trainerId: userOne, customerId: userTwo },
          { trainerId: userTwo, customerId: userOne }
        ],
        conversationId: conversationId
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Now fetch messages for this conversation
    return await prisma.chatMessage.findMany({
      where: { conversationId: conversation.conversationId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw new Error("Failed to fetch conversation");
  }
};

/**
 * Get chat list for a user (as trainer or customer).
 * @param {String} userId 
 * @returns {Promise<Array>} List of chat conversations
 */
export const getChatList = async (userId) => {
  try {
    return await prisma.chatConversation.findMany({
      where: {
        OR: [{ trainerId: userId }, { customerId: userId }],
      },
      orderBy: {
        lastMessageTime: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    throw new Error("Failed to fetch chat list");
  }
};

/**
 * Mark all messages as read for a user in a conversation.
 * @param {String} conversationId 
 * @param {String} userId 
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        status: { not: "READ" },
      },
      data: {
        status: "READ",
      },
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
};


/**
 * Create a new chat conversation between a trainer and a customer.
 * If a conversation between these users exists, it will return the existing one.
 * @param {String} trainerId 
 * @param {String} customerId 
 * @returns {Promise<Object>} The created or existing conversation
 */
export const createConversation = async (trainerId, customerId) => {
  try {
    // Check if conversation already exists
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        trainerId,
        customerId,
      },
    });

    if (conversation) {
      return conversation;
    }

    // Create new conversation
    let conversationId = customerId + '_' + trainerId;
    conversation = await prisma.chatConversation.create({
      data: {
        trainerId,
        customerId,
        conversationId,
        lastMessageTime: new Date(),
      },
    });

    return conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Failed to create conversation");
  }
};


/**
 * Get a chat conversation between a trainer and a customer, regardless of order of params.
 * Checks both (trainerId, customerId) and (customerId, trainerId).
 * @param {String} userId1 - First user id (can be trainer or customer)
 * @param {String} userId2 - Second user id (can be customer or trainer)
 * @returns {Promise<Object|null>}
 */
export const getConversationByUsers = async (userId1, userId2) => {
  try {
    // Try (userId1 as trainer, userId2 as customer)
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        trainerId: userId1,
        customerId: userId2,
      },
    });
    if (conversation) {
      return conversation;
    }
    // Try (userId2 as trainer, userId1 as customer)
    conversation = await prisma.chatConversation.findFirst({
      where: {
        trainerId: userId2,
        customerId: userId1,
      },
    });
    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw new Error("Failed to fetch conversation");
  }
};