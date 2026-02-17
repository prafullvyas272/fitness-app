import { getAllTrainers, getAllCustomers, assignCustomer, toggleUserIsActive, unassignCustomer } from "../services/user.service.js";

/**
 * Get all trainers
 */
export const getAllTrainersHandler = async (req, res) => {
    try {
        const trainers = await getAllTrainers();

        console.log(trainers)
        const formattedTrainers = trainers.map(
            ({ assignedCustomersAsTrainer, userProfileDetails, ...trainer }) => ({
                ...trainer,
                assignedCustomers: assignedCustomersAsTrainer,
                userProfileDetails: Array.isArray(userProfileDetails) && userProfileDetails.length > 0 ? userProfileDetails[0] : null
            })
        );
        res.status(200).json({
            success: true,
            message: 'Trainers list fetched sucessfully.',
            data: formattedTrainers,
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

        const formattedCustomers = customers.map(
            ({ assignedCustomersAsCustomer, ...customer }) => ({
            ...customer,
            assignedTrainers: assignedCustomersAsCustomer
            
            })
        );
        res.status(200).json({
            success: true,
            message: 'Customers list fetched sucessfully.',
            data: formattedCustomers,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};


/**
 * Assign a customer to a trainer
 */
export const assignCustomerHandler = async (req, res) => {
    try {
        const { trainerId, customerId } = req.body;

        const assignment = await assignCustomer(trainerId, customerId);

        res.status(200).json({
            success: true,
            message: "Customer successfully assigned to trainer.",
            data: assignment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};


/**
 * Toggle the isActive status for a user.
 */
export const toggleUserIsActiveHandler = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isActive } = req.body;

        const updatedUser = await toggleUserIsActive(userId, isActive);

        res.status(200).json({
            success: true,
            message: "User isActive status updated successfully.",
            data: updatedUser
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};


/**
 * Unassign a customer from a trainer.
 */
export const unassignCustomerHandler = async (req, res) => {
    try {
        const customerId = req.params.id;
        const { trainerId } = req.body;

        const deletedAssignment = await unassignCustomer(trainerId, customerId);

        res.status(200).json({
            success: true,
            message: "Customer successfully unassigned from trainer.",
            data: deletedAssignment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
