import {
    createTrainer,
    updateTrainer,
    deleteTrainer,
    showTrainerProfileData,
} from "../services/trainer.service.js";

/**
 * Controller for creating a new trainer user.
 */
export const createTrainerHandler = async (req, res) => {
    try {
        const trainerData = req.body;
        const trainer = await createTrainer(trainerData);
        res.status(201).json({
            success: true,
            message: "Trainer created successfully.",
            data: trainer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Controller for updating an existing trainer user.
 */
export const updateTrainerHandler = async (req, res) => {
    try {
        const trainerId = req.params.id;
        const updateData = req.body;
        const updatedTrainer = await updateTrainer(trainerId, updateData);
        res.status(200).json({
            success: true,
            message: "Trainer updated successfully.",
            data: updatedTrainer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Controller for deleting a trainer user.
 */
export const deleteTrainerHandler = async (req, res) => {
    try {
        const trainerId = req.params.id;
        const deletedTrainer = await deleteTrainer(trainerId);
        res.status(200).json({
            success: true,
            message: "Trainer deleted successfully.",
            data: deletedTrainer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Controller for retrieving a trainer's profile data.
 */
export const showTrainerProfileDataHandler = async (req, res) => {
    try {
        const trainerId = req.params.id;
        const profileData = await showTrainerProfileData(trainerId);
        res.status(200).json({
            success: true,
            message: "Trainer profile data fetched successfully.",
            data: profileData,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
