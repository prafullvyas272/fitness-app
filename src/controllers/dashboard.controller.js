import {
  getStepsDashboard,
  getWeightDashboard,
  getRecentJournals,
} from "../services/dashboard.service.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [steps, weight, journals] = await Promise.all([
      getStepsDashboard(userId),
      getWeightDashboard(userId),
      getRecentJournals(userId),
    ]);

    res.json({
      success: true,
      data: {
        steps,
        weight,
        journals,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};