import {
    getUserAvailabilityDataByDate,
    setUserAvailabilityForDate,
    canTrainerApplyLeave,
    applyLeave,
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

/**
 * Set a trainer's daily availability for a specific date
 */

export const setUserAvailability = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date, isAvailable, peakSlots, alternativeSlots } = req.body;

        if (!isAvailable) {
            const canApply = await canTrainerApplyLeave(userId, date)
            if (!canApply) {
                res.status(200).json({
                    success: false,
                    message: 'You already have applied 1 leave this month. Please contact admin.',
                });
            }
            await applyLeave(userId, date);
            res.status(200).json({
                success: true,
                message: 'Leave applied successfully.',
            });
        }

        const availability = {
            date,
            isAvailable,
            peakSlots: Array.isArray(peakSlots) ? peakSlots : [],
            alternativeSlots: Array.isArray(alternativeSlots) ? alternativeSlots : [],
        };

        const data = await setUserAvailabilityForDate(userId, availability);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

