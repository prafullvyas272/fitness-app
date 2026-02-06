import { getAllTrainers, getAllCustomers } from "../services/user.service.js";

/**
 * Get all trainers
 */
export const getAllTrainersHandler = async (req, res) => {
    try {
        const trainers = await getAllTrainers();
        res.status(200).json({
            success: true,
            message: 'Trainers list fetched sucessfully.',
            data: trainers,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};



/**
 * Get all customers
 */
export const getAllCustomersHandler = async (req, res) => {
    try {
        const customers = await getAllCustomers();
        res.status(200).json({
            success: true,
            message: 'Customers list fetched sucessfully.',
            data: customers,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
