import { getAllTrainers } from "../services/user.service.js";

/**
 * Get all trainers
 */
export const getAllTrainersHandler = async (req, res) => {
    try {
        const trainers = await getAllTrainers();
        res.status(200).json({
            success: true,
            data: trainers,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};


