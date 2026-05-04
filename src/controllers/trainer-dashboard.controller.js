import { getTrainerDashboard } from "../services/trainer-dashboard.service.js";

export const getTrainerDashboardHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const period = req.query.period || "weekly";

    if (!["weekly", "monthly", "yearly"].includes(period)) {
      return res.status(400).json({ error: "period must be weekly, monthly, or yearly" });
    }

    const data = await getTrainerDashboard(trainerId, period);
    res.json({ success: true, period, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
