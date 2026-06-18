import {
  createTrainerIssueReport,
  getMyTrainerIssueReports,
  getAllTrainerIssueReports,
  updateTrainerIssueReportStatus,
} from "../services/trainer-issue-report.service.js";

export const createTrainerIssueReportHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { subject, category, priority, description } = req.body;

    if (!subject || !category) {
      return res.status(400).json({
        success: false,
        message: "subject and category are required",
      });
    }

    const data = await createTrainerIssueReport({ trainerId, subject, category, priority, description });

    res.status(201).json({
      success: true,
      message: "Issue report submitted successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyTrainerIssueReportsHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const data = await getMyTrainerIssueReports(trainerId);

    res.status(200).json({
      success: true,
      message: "Your issue reports fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllTrainerIssueReportsHandler = async (req, res) => {
  try {
    const { page, pageSize, status, category, priority } = req.query;

    const data = await getAllTrainerIssueReports({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      status,
      category,
      priority,
    });

    res.status(200).json({
      success: true,
      message: "Trainer issue reports fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateTrainerIssueReportStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status && adminNote === undefined) {
      return res.status(400).json({
        success: false,
        message: "status or adminNote is required",
      });
    }

    const data = await updateTrainerIssueReportStatus(id, { status, adminNote });

    res.status(200).json({
      success: true,
      message: "Issue report updated successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
