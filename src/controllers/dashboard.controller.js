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

    // Suppress notify if no real data exists yet
    if (steps?.goal === null || steps?.goal === 0) {
      steps.notify = false;
    }
    if (weight?.goal === null || weight?.goal === 0) {
      weight.notify = false;
    }

    res.json({
      success: true,
      data: { steps, weight, journals },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};