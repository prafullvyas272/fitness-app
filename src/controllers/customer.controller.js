import {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    showCustomerProfileData,
    applyForUPT,
    updateMyProfile,
} from "../services/customer.service.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import prisma from "../utils/prisma.js";

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


/**
 * Controller for applying for a User Personal Trainer (UPT).
 * Handles customer requests to connect with a trainer and triggers notification.
 */
export const applyForUPTHandler = async (req, res) => {
    try {
        const { trainerId, message } = req.body;
        const customerId = req.user.userId;
        console.log(req.user)
        const trainerRequest = await applyForUPT({ customerId, trainerId, message });
        res.status(201).json({
            success: true,
            message: "Trainer request submitted successfully.",
            data: trainerRequest
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

export const getTrainerPlanForCustomer = async (req, res) => {
    try {
        const customerId = req.user.userId;

        const assigned = await prisma.assignedCustomer.findFirst({
            where: {
                customerId,
                isActive: true,
            },
            include: {
                trainer: {
                    include: {
                        plan: true,
                    },
                },
            },
        });

        if (!assigned) {
            return res.status(404).json({
                success: false,
                message: "No active trainer assignment found for this customer.",
            });
        }

        res.status(200).json({
            success: true,
            data: assigned.trainer.plan,
        });
    }
        catch (err) {
    res.status(400).json({
        success: false,
        message: err.message,
    });
}
};

export const buyPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "planId is required"
      });
    }

    // 🔥 Check if already active subscription
    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE"
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have an active plan"
      });
    }

    // 🔥 Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: "ACTIVE"
      },
      include: {
        plan: true
      }
    });

    // 🔥 Mark user premium
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremiumMember: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Plan purchased successfully",
      data: subscription
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const cancelPlan = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 🔥 Find active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE"
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    // 🔥 Cancel it
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        endDate: new Date()
      }
    });

    // 🔥 Remove premium access
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremiumMember: false
      }
    });

    res.status(200).json({
      success: true,
      message: "Plan cancelled successfully",
      data: updated
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// ... all existing controllers stay same ...

/**
 * Customer updates their OWN profile.
 * ID comes from JWT token — not from params.
 */
export const updateMyProfileHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;  // ✅ from token
    const updateData = { ...req.body };

    // ✅ Handle avatar upload
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "customer_avatars"
      );
      updateData.avatarUrl = uploadResult.secure_url;
      updateData.avatarPublicId = uploadResult.public_id;
    }

    const updatedCustomer = await updateMyProfile(customerId, updateData);

    // ✅ Flatten userProfileDetails for clean response
    let profileDetails = null;
    if (
      Array.isArray(updatedCustomer.userProfileDetails) &&
      updatedCustomer.userProfileDetails.length > 0
    ) {
      profileDetails = updatedCustomer.userProfileDetails[0];
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        ...updatedCustomer,
        userProfileDetails: profileDetails,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};