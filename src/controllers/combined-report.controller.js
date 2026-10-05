import { getAllReportsForAdmin } from "../services/combined-report.service.js";

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
