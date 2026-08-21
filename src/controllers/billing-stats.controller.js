import {
  getActiveSubscriptionsCount,
  getTotalPlansCount,
  getExpiringPlansCount,
  getBillingStats,
} from "../services/billing-stats.service.js";

export const getActiveSubscriptionsCountHandler = async (req, res) => {
  try {
    const activeSubscriptions = await getActiveSubscriptionsCount();

    res.status(200).json({
      success: true,
      data: {
        activeSubscriptions,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active subscriptions count",
      error: err.message,
    });
  }
};

export const getTotalPlansCountHandler = async (req, res) => {
  try {
    const totalPlans = await getTotalPlansCount();

    res.status(200).json({
      success: true,
      data: {
        totalPlans,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans count",
      error: err.message,
    });
  }
};

export const getExpiringPlansCountHandler = async (req, res) => {
  try {
    const expiringPlans = await getExpiringPlansCount();

    res.status(200).json({
      success: true,
      data: {
        expiringPlans,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expiring plans count",
      error: err.message,
    });
  }
};

export const getBillingStatsHandler = async (req, res) => {
  try {
    const stats = await getBillingStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch billing stats",
      error: err.message,
    });
  }
};
