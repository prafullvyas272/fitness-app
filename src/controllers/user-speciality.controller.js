import {
    setUserSpecialities,
    getUserSpecialities,
} from "../services/user-speciality.service.js";

/**
 * Update specialities
 */
export const updateSpecialities = async (req, res) => {
    try {
        const userId = req.user.userId; // from JWT
        const { specialityIds } = req.body;

        if (!Array.isArray(specialityIds) || specialityIds.length === 0) {
            throw new Error("specialityIds must be a non-empty array");
        }

        await setUserSpecialities(userId, specialityIds);

        res.status(200).json({
            success: true,
            message: "Specialities updated successfully",
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Get specialities
 */
export const getSpecialities = async (req, res) => {
    try {
        const userId = req?.user?.userId ?? null;

        const specialityIds = await getUserSpecialities(userId);

        res.status(200).json({
            success: true,
            data: {
                specialityIds,
            },
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
