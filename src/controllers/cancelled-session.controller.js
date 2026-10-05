import { getCancelledSessionsForAdmin, getCancelledSessionsForMentor } from "../services/cancelled-session.service.js";

export const getCancelledSessionsForAdminHandler = async (req, res) => {
  try {
    const { trainerId, page = 1, pageSize = 10 } = req.query;

    const result = await getCancelledSessionsForAdmin({
      trainerId: trainerId || null,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    res.status(200).json({
      success: true,
      message: "Cancelled sessions fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Mentor-side: cancelled sessions for trainers assigned to the logged-in
 * mentor. Scoped to req.user.userId, never a param.
 */
export const getCancelledSessionsForMentorHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { trainerId, page = 1, pageSize = 10 } = req.query;

    const result = await getCancelledSessionsForMentor(mentorId, {
      trainerId: trainerId || null,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    res.status(200).json({
      success: true,
      message: "Cancelled sessions fetched successfully",
      data: result,
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
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
