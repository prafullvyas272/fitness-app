import {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    showCustomerProfileData,
} from "../services/customer.service.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

/**
 * Controller for creating a new customer user.
 */
export const createCustomerHandler = async (req, res) => {
    try {
        const customerData = req.body;

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, "customer_avatars");
            customerData.avatarUrl = uploadResult.secure_url;
            customerData.avatarPublicId = uploadResult.public_id;
        }

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

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, "customer_avatars");
            updateData.avatarUrl = uploadResult.secure_url;
            updateData.avatarPublicId = uploadResult.public_id;
        }

        const updatedCustomer = await updateCustomer(customerId, updateData);

        let customerData = { ...updatedCustomer };
        if (Array.isArray(customerData.userProfileDetails) && customerData.userProfileDetails.length > 0) {
            customerData.userProfileDetails = customerData.userProfileDetails[0];
        } else {
            customerData.userProfileDetails = null;
        }
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

        // Map assignedCustomersAsCustomer to assignedTrainers
        const {
            assignedCustomersAsCustomer,
            ...restProfile
        } = profileData;

        const assignedTrainers = Array.isArray(assignedCustomersAsCustomer)
            ? assignedCustomersAsCustomer
            : [];

        res.status(200).json({
            success: true,
            message: "Customer profile data fetched successfully.",
            data: {
                ...restProfile,
                assignedTrainers,
            },
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
