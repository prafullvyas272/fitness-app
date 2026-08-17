import {
  getAllMentors,
  getMentorById,
  getMentorStats
} from "../services/admin-mentor.service.js";

export const getAllMentorsHandler = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    const result = await getAllMentors({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search: search || null
    });

    res.status(200).json({
      success: true,
      message: "Mentors fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_MENTORS_FAILED"
    });
  }
};

export const getMentorByIdHandler = async (req, res) => {
  try {
    const { mentorId } = req.params;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
        error: "MISSING_MENTOR_ID"
      });
    }

    const result = await getMentorById(mentorId);

    res.status(200).json({
      success: true,
      message: "Mentor fetched successfully",
      data: result
    });
  } catch (error) {
    if (error.message === "Mentor not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: "NOT_FOUND"
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_MENTOR_FAILED"
    });
  }
};

export const getMentorStatsHandler = async (req, res) => {
  try {
    const result = await getMentorStats();

    res.status(200).json({
      success: true,
      message: "Mentor statistics fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_STATS_FAILED"
    });
  }
};
