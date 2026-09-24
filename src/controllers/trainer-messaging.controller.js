import { getMentorConversations, getMessagesFromMentor, sendMessageToMentor } from "../services/trainer-messaging.service.js";

export const getMentorConversationsHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;

    const result = await getMentorConversations(trainerId);

    res.status(200).json({
      success: true,
      message: "Mentor conversations fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMessagesFromMentorHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { mentorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "mentorId is required",
      });
    }

    const result = await getMessagesFromMentor(trainerId, mentorId, Number(page), Number(limit));

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: result,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const sendMessageToMentorHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { mentorId } = req.params;
    const { message } = req.body;

    if (!mentorId || !message) {
      return res.status(400).json({
        success: false,
        message: "mentorId and message are required",
      });
    }

    const result = await sendMessageToMentor(trainerId, mentorId, message);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: result,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
