import { getAllReportsForAdmin, getAllReportsForMentor, resolveReportForMentor } from "../services/combined-report.service.js";

export const getAllReportsForAdminHandler = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, reportType } = req.query;

    const result = await getAllReportsForAdmin({
      page: Number(page),
      pageSize: Number(pageSize),
      status: status || null,
      reportType: reportType || null,
    });

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
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
 * Mentor-side: same unified report list, scoped to req.user.userId as the
 * mentor, never a param.
 */
export const getAllReportsForMentorHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { page = 1, pageSize = 10, status, reportType, trainerId } = req.query;

    const result = await getAllReportsForMentor(mentorId, {
      trainerId: trainerId || null,
      page: Number(page),
      pageSize: Number(pageSize),
      status: status || null,
      reportType: reportType || null,
    });

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
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

/**
 * Mentor-side: mark one report (either direction) as resolved. Scoped to
 * req.user.userId as the mentor; the report's trainer must be assigned to
 * them. Updates the same row GET /api/admin/reports reads, so admin sees
 * the resolved status immediately too.
 */
export const resolveReportForMentorHandler = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { reportId } = req.params;
    const { reportType } = req.body;

    const result = await resolveReportForMentor(mentorId, reportId, reportType || null);

    res.status(200).json({
      success: true,
      message: "Report marked as resolved",
      data: result,
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }
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
