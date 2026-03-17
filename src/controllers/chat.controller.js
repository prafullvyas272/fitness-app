import * as chatService from "../services/chat.service.js";

export const sendMessageHandler = async (req, res) => {
  try {
    const { senderId, receiverId, message, type } = req.body;
    let fileBuffer = null;

    if (req.file && req.file.buffer) {
      fileBuffer = req.file.buffer;
    }

    const result = await chatService.sendMessage({
      senderId,
      receiverId,
      message,
      type,
      file: fileBuffer,
    });
    res.status(200).json({
      success: true,
      message: "Message sent",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getConversationHandler = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await chatService.getConversation(conversationId);
    res.status(200).json({
      success: true,
      message: "Conversation fetched",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getChatListHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await chatService.getChatList(userId);
    res.status(200).json({
      success: true,
      message: "Chat list fetched",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const markMessagesAsReadHandler = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    await chatService.markMessagesAsRead(conversationId, userId);
    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


/**
 * Create a new conversation between a trainer and a customer.
 * Returns the existing conversation if one already exists.
 */
export const createConversationHandler = async (req, res) => {
  try {
    const { trainerId, customerId } = req.body;
    const conversation = await chatService.createConversation(trainerId, customerId);
    res.status(200).json({
      success: true,
      message: "Conversation created or already exists",
      data: conversation,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};