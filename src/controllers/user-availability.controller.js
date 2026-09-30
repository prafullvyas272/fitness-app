import {
    getUserAvailabilityDataByDate,
    getUserWeeklyAvailabilitySummary,
    setUserAvailabilityForDate,
    canTrainerApplyLeave,
    applyLeave,
    deleteAlternativeSlot,
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
        console.log(availability)

        if (!availability) {
            return res.status(200).json({
                success: true,
                message: 'No availability found for this date.',
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

/**
 * Get a trainer's weekly availability summary for the week containing a specific date
 */
export const getUserWeeklyAvailability = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Missing required query parameter: date",
            });
        }

        const weeklyData = await getUserWeeklyAvailabilitySummary(userId, date);

        res.status(200).json({
            success: true,
            data: weeklyData,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Delete a trainer's own alternative slot by its timeSlotId
 */
export const deleteAlternativeSlotHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { timeSlotId } = req.params;

        if (!timeSlotId) {
            return res.status(400).json({
                success: false,
                message: "timeSlotId is required",
            });
        }

        const result = await deleteAlternativeSlot(userId, timeSlotId);

        res.status(200).json({
            success: true,
            message: "Alternative slot deleted successfully",
            data: result,
        });
    } catch (err) {
        if (err.message.includes("not found")) {
            return res.status(404).json({
                success: false,
                message: err.message,
            });
        }
        if (err.message.includes("not authorized") || err.message.includes("already booked")) {
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

