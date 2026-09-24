import {
  createCustomerReport,
  getCustomerReportsByAdmin,
  getCustomerReportsByTrainer,
  getCustomerReportsByCustomer,
  getReportByBooking,
  updateReportStatus,
  deleteReport
} from "../services/trainer-customer-report.service.js";

export const createCustomerReportHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { bookingId, customerId, reason, description } = req.body;

    if (!bookingId || !customerId || !reason) {
      return res.status(400).json({
        success: false,
        message: "bookingId, customerId, and reason are required"
      });
    }

    const report = await createCustomerReport(trainerId, bookingId, { customerId, reason, description });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("within 24 hours")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("marked as ATTENDED")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getCustomerReportsByAdminHandler = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;

    const result = await getCustomerReportsByAdmin(Number(page), Number(pageSize), status || null);

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getCustomerReportsByTrainerHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { page = 1, pageSize = 10 } = req.query;

    const result = await getCustomerReportsByTrainer(trainerId, Number(page), Number(pageSize));

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getCustomerReportsByCustomerHandler = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is required"
      });
    }

    const result = await getCustomerReportsByCustomer(customerId, Number(page), Number(pageSize));

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getReportByBookingHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    const report = await getReportByBooking(bookingId);

    res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: report
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const updateReportStatusHandler = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { reportId } = req.params;
    const { status } = req.body;

    if (!reportId || !status) {
      return res.status(400).json({
        success: false,
        message: "reportId and status are required"
      });
    }

    const report = await updateReportStatus(reportId, adminId, status);

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: report
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const deleteReportHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: "reportId is required"
      });
    }

    const result = await deleteReport(reportId, trainerId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
