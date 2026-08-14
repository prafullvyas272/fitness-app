import {
  getAllSchedules,
  getSchedulesByDateRange,
  getScheduleAlerts,
  acknowledgeAlert,
  getScheduleStats,
  getAlertsSummary
} from "../services/mentor-schedules.service.js";

export const getAllSchedulesHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { page = 1, limit = 20, date, status } = req.query;

    const data = await getAllSchedules(mentorId, {
      page: parseInt(page),
      limit: parseInt(limit),
      date,
      status
    });

    res.status(200).json({
      success: true,
      message: "Schedules fetched successfully",
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getSchedulesByDateRangeHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
        error: "MISSING_PARAMS"
      });
    }

    const data = await getSchedulesByDateRange(mentorId, startDate, endDate);

    res.status(200).json({
      success: true,
      message: "Schedules fetched successfully",
      data
    });
  } catch (err) {
    if (err.message.includes("Start date must be before end date")) {
      return res.status(400).json({
        success: false,
        message: err.message,
        error: "INVALID_DATE_RANGE"
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getScheduleAlertsHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { urgency, limit = 10 } = req.query;

    const data = await getScheduleAlerts(mentorId, {
      urgency,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      message: "Alerts fetched successfully",
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const acknowledgeAlertHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { alertId } = req.params;
    const { resolved, action } = req.body;

    if (resolved !== true || action !== "acknowledged") {
      return res.status(400).json({
        success: false,
        message: "Only acknowledgement (resolved: true, action: 'acknowledged') is allowed",
        error: "INVALID_ACTION"
      });
    }

    const data = await acknowledgeAlert(mentorId, alertId);

    res.status(200).json({
      success: true,
      message: "Alert acknowledged successfully",
      data
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
        error: "NOT_FOUND"
      });
    }
    if (err.message.includes("do not have access")) {
      return res.status(403).json({
        success: false,
        message: err.message,
        error: "FORBIDDEN"
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getScheduleStatsHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { period = "week" } = req.query;

    const data = await getScheduleStats(mentorId, period);

    res.status(200).json({
      success: true,
      message: "Statistics fetched successfully",
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getAlertsSummaryHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const data = await getAlertsSummary(mentorId);

    res.status(200).json({
      success: true,
      message: "Alerts summary fetched successfully",
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
