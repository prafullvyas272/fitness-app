import {
    createTrainer,
    updateTrainer,
    deleteTrainer,
    showTrainerProfileData,
} from "../services/trainer.service.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

/**
 * Controller for creating a new trainer user.
 */
export const createTrainerHandler = async (req, res) => {
    try {
        const trainerData = req.body;

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, "trainer_avatars");
            trainerData.avatarUrl = uploadResult.secure_url;
            trainerData.avatarPublicId = uploadResult.public_id;
        }

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

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, "trainer_avatars");
            updateData.avatarUrl = uploadResult.secure_url;
            updateData.avatarPublicId = uploadResult.public_id;
        }
          
        const updatedTrainer = await updateTrainer(trainerId, updateData);
        // Ensure userProfileDetails is returned as object (not array) if exists, else null
        let trainerData = { ...updatedTrainer };
        if (Array.isArray(trainerData.userProfileDetails) && trainerData.userProfileDetails.length > 0) {
            trainerData.userProfileDetails = trainerData.userProfileDetails[0];
        } else {
            trainerData.userProfileDetails = null;
        }
        res.status(200).json({
            success: true,
            message: "Trainer updated successfully.",
            data: trainerData,
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
