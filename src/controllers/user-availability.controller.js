import {
    getUserAvailabilityDataByDate,
} from "../services/user-availability.service.js";

/**
 * Get a trainer's daily availability for a specific date
 */
export const getUserAvailability = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required query parameter: date',
            });
        }

        const availability = await getUserAvailabilityDataByDate(userId, date);

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: 'No availability found for this date',
            });
        }

        res.status(200).json({
            success: true,
            data: availability,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
