import {
  createCustomerReport,
  getMyCustomerReports,
  getAllCustomerReports,
  updateCustomerReportStatus,
} from "../services/customer-report.service.js";

export const createCustomerReportHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { subject, category, priority, description } = req.body;

    if (!description && !subject) {
      return res.status(400).json({
        success: false,
        message: "description is required",
      });
    }

    // subject and category are stored fields (used by the admin reports table)
    // but the mobile app only collects a free-text description, so derive them.
    const finalSubject = subject || description.slice(0, 60);
    const finalCategory = category || "OTHER";

    const data = await createCustomerReport({ customerId, subject: finalSubject, category: finalCategory, priority, description });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyCustomerReportsHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const data = await getMyCustomerReports(customerId);

    res.status(200).json({
      success: true,
      message: "Your reports fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllCustomerReportsHandler = async (req, res) => {
  try {
    const { page, pageSize, status, category, priority } = req.query;

    const data = await getAllCustomerReports({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      status,
      category,
      priority,
    });

    res.status(200).json({
      success: true,
      message: "Customer reports fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateCustomerReportStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status && adminNote === undefined) {
      return res.status(400).json({
        success: false,
        message: "status or adminNote is required",
      });
    }

    const data = await updateCustomerReportStatus(id, { status, adminNote });

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
