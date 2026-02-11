import {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    showCustomerProfileData,
} from "../services/customer.service.js";

/**
 * Controller for creating a new customer user.
 */
export const createCustomerHandler = async (req, res) => {
    try {
        const customerData = req.body;
        const customer = await createCustomer(customerData);
        res.status(201).json({
            success: true,
            message: "Customer created successfully.",
            data: customer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Controller for updating an existing customer user.
 */
export const updateCustomerHandler = async (req, res) => {
    try {
        const customerId = req.params.id;
        const updateData = req.body;
        const updatedCustomer = await updateCustomer(customerId, updateData);
        res.status(200).json({
            success: true,
            message: "Customer updated successfully.",
            data: updatedCustomer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Controller for deleting a customer user.
 */
export const deleteCustomerHandler = async (req, res) => {
    try {
        const customerId = req.params.id;
        const deletedCustomer = await deleteCustomer(customerId);
        res.status(200).json({
            success: true,
            message: "Customer deleted successfully.",
            data: deletedCustomer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/**
 * Controller for retrieving a customer's profile data.
 */
export const showCustomerProfileDataHandler = async (req, res) => {
    try {
        const customerId = req.params.id;
        const profileData = await showCustomerProfileData(customerId);
        res.status(200).json({
            success: true,
            message: "Customer profile data fetched successfully.",
            data: profileData,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
