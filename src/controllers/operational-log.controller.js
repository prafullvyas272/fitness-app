import { createOperationalLog, getOperationalLogs, getOperationalLogById, getOperationalLogStats, deleteOperationalLog } from "../services/operational-log.service.js";

export const createLogHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { ptId, date, activityType, hours, minutes, notes } = req.body;

    if (!ptId || !date || !activityType) {
      return res.status(400).json({
        success: false,
        message: "ptId, date, and activityType are required",
      });
    }

    const log = await createOperationalLog(mentorId, { ptId, date, activityType, hours, minutes, notes });

    res.status(201).json({
      success: true,
      message: "Log created successfully",
      data: log,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    if (err.message.includes("not assigned")) {
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

export const getLogsHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const result = await getOperationalLogs(mentorId, Number(page), Number(limit));

    res.status(200).json({
      success: true,
      message: "Logs fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getLogByIdHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { logId } = req.params;

    if (!logId) {
      return res.status(400).json({
        success: false,
        message: "logId is required",
      });
    }

    const log = await getOperationalLogById(mentorId, logId);

    res.status(200).json({
      success: true,
      message: "Log fetched successfully",
      data: log,
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

export const getStatsHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const stats = await getOperationalLogStats(mentorId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteLogHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { logId } = req.params;

    if (!logId) {
      return res.status(400).json({
        success: false,
        message: "logId is required",
      });
    }

    const result = await deleteOperationalLog(mentorId, logId);

    res.status(200).json({
      success: true,
      message: result.message,
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
