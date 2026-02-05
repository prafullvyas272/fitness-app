import { getDashboardAnalytics } from "../services/dashboard-analytics.service.js";

/**
 * Get dashboard analytics
 */
export const getDashboardAnalyticsController = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await getDashboardAnalytics(userId);

        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
