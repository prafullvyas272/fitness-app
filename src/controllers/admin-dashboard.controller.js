import { getAdminDashboardStats } from "../services/admin-dashboard.service.js";

export const getAdminDashboardStatsHandler = async (req, res) => {
  try {
    const { month, year, limit } = req.query;
    const data = await getAdminDashboardStats({ month, year, limit });

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
