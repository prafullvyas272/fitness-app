import {
  getAllReports,
  getReportById,
  updateReportStatus,
  getActivityFeed,
  getReportStats,
  getReportsSummary
} from "../services/mentor-reports.service.js";

export const getAllReportsHandler = async (req, res) => {
  try {
    const { page, limit, status, priority, category, trainerId, search } = req.query;
    const mentorId = req.user.userId;

    const result = await getAllReports(mentorId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status: status || null,
      priority: priority || null,
      category: category || null,
      trainerId: trainerId || null,
      search: search || null
    });

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_REPORTS_FAILED"
    });
  }
};

export const getReportByIdHandler = async (req, res) => {
  try {
    const { reportId } = req.params;
    const mentorId = req.user.userId;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
        error: "MISSING_REPORT_ID"
      });
    }

    const result = await getReportById(mentorId, reportId);

    res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: result
    });
  } catch (error) {
    if (error.message === "You do not have access to this report") {
      return res.status(403).json({
        success: false,
        message: error.message,
        error: "FORBIDDEN"
      });
    }

    if (error.message === "Report not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: "NOT_FOUND"
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_REPORT_FAILED"
    });
  }
};

export const updateReportStatusHandler = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, priority, resolutionNotes, action } = req.body;
    const mentorId = req.user.userId;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
        error: "MISSING_REPORT_ID"
      });
    }

    if (!status && !priority && !resolutionNotes) {
      return res.status(400).json({
        success: false,
        message: "At least one field (status, priority, or resolutionNotes) is required",
        error: "NO_UPDATE_FIELDS"
      });
    }

    const result = await updateReportStatus(mentorId, reportId, {
      status: status || null,
      priority: priority || null,
      resolutionNotes: resolutionNotes || null,
      action: action || "status_update"
    });

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: result
    });
  } catch (error) {
    if (error.message === "You do not have access to this report") {
      return res.status(403).json({
        success: false,
        message: error.message,
        error: "FORBIDDEN"
      });
    }

    if (error.message === "Report not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: "NOT_FOUND"
      });
    }

    if (error.message.includes("Only status_update action")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: "INVALID_ACTION"
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
      error: "UPDATE_FAILED"
    });
  }
};

export const getActivityFeedHandler = async (req, res) => {
  try {
    const { limit } = req.query;
    const mentorId = req.user.userId;

    const result = await getActivityFeed(mentorId, {
      limit: limit ? parseInt(limit) : 20
    });

    res.status(200).json({
      success: true,
      message: "Activity feed fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: "FETCH_ACTIVITY_FAILED"
    });
  }
};

export const getReportStatsHandler = async (req, res) => {
  try {
    const { period } = req.query;
    const mentorId = req.user.userId;

    const result = await getReportStats(mentorId, period || "month");

    res.status(200).json({
      success: true,
      message: "Statistics fetched successfully",
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

export const getReportsSummaryHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const result = await getReportsSummary(mentorId);

    res.status(200).json({
      success: true,
      message: "Summary fetched successfully",
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
