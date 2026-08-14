import {
  getDashboardOverview,
  getPerformanceTrajectory,
  getDashboardSummary
} from "../services/mentor-dashboard.service.js";

export const getDashboardOverviewHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const result = await getDashboardOverview(mentorId);

    res.status(200).json({
      success: true,
      message: "Dashboard overview fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_OVERVIEW_FAILED"
    });
  }
};

export const getPerformanceTrajectoryHandler = async (req, res) => {
  try {
    const { period = "7D" } = req.query;
    const mentorId = req.user.userId;

    if (!["7D", "30D"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Period must be either '7D' or '30D'",
        error: "INVALID_PERIOD"
      });
    }

    const result = await getPerformanceTrajectory(mentorId, period);

    res.status(200).json({
      success: true,
      message: "Performance trajectory fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_TRAJECTORY_FAILED"
    });
  }
};

export const getDashboardSummaryHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const result = await getDashboardSummary(mentorId);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_SUMMARY_FAILED"
    });
  }
};
