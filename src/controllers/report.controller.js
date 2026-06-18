import { createReport, getAllReports, getReportById, updateReportStatus } from "../services/report.service.js";

export const createReportHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { customerId, sessionDate, category, priority, description } = req.body;

    if (!customerId || !sessionDate || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "customerId, sessionDate, category, and description are required",
      });
    }

    const data = await createReport({ trainerId, customerId, sessionDate, category, priority, description });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllReportsHandler = async (req, res) => {
  try {
    const { page, pageSize, category, priority, status } = req.query;

    const data = await getAllReports({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      category,
      priority,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getReportByIdHandler = async (req, res) => {
  try {
    const data = await getReportById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateReportStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status && adminNote === undefined) {
      return res.status(400).json({
        success: false,
        message: "status or adminNote is required",
      });
    }

    const data = await updateReportStatus(id, { status, adminNote });

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
