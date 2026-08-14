import {
  getConversationList,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
} from "../services/mentor-messaging.service.js";

export const getConversationListHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const data = await getConversationList(mentorId);

    res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getConversationMessagesHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const data = await getConversationMessages(
      mentorId,
      conversationId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data,
    });
  } catch (err) {
    if (err.message.includes("Invalid conversation")) {
      return res.status(403).json({
        success: false,
        message: err.message,
        error: "UNAUTHORIZED",
      });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
        error: "NOT_FOUND",
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const sendMessageHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { conversationId, ptId, message } = req.body;

    if (!conversationId || !ptId || !message) {
      return res.status(400).json({
        success: false,
        message: "conversationId, ptId, and message are required",
        error: "INVALID_REQUEST",
      });
    }

    const data = await sendMessage(mentorId, conversationId, ptId, message);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
        error: "NOT_FOUND",
      });
    }
    if (err.message.includes("not assigned")) {
      return res.status(403).json({
        success: false,
        message: err.message,
        error: "UNAUTHORIZED",
      });
    }
    if (err.message.includes("cannot be empty")) {
      return res.status(400).json({
        success: false,
        message: err.message,
        error: "INVALID_MESSAGE",
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const markMessagesAsReadHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { conversationId, messageIds } = req.body;

    if (!conversationId || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: "conversationId and messageIds array are required",
        error: "INVALID_REQUEST",
      });
    }

    await markMessagesAsRead(mentorId, conversationId, messageIds);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
        error: "NOT_FOUND",
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getUnreadCountHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const data = await getUnreadCount(mentorId);

    res.status(200).json({
      success: true,
      message: "Unread count fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
