import prisma from "../utils/prisma.js";
import { getHashedPassword } from "../utils/password.js";
import { sendTrainerRequestNotification } from "./notification.service.js";

/**
 * Create a new Customer user.
 * @param {object} data - User data for customer creation.
 * @returns {object} The created customer user.
 */
export const createCustomer = async (data) => {
  // Ensure roleId is for Customer
  const customerRole = await prisma.role.findUnique({
    where: { name: 'Customer' },
    select: { id: true }
  });
  if (!customerRole) {
    throw new Error("Customer role not found");
  }

  // Check for required fields
  if (!data.email) {
    throw new Error("Email is required.");
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });
  if (existing) {
    throw new Error("Email already in use.");
  }

  const hashedPassword = await getHashedPassword(data.password);

  // Wrap all creation in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the customer user first
    const customer = await tx.user.create({
      data: {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword,
        gender: data.gender,
        roleId: customerRole.id,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        gender: true,
        roleId: true,
        createdAt: true,
      },
    });

    // Create a UserProfileDetail record for the customer if profile fields are provided
    const profileFields = {};
    if (
      data.address !== undefined ||
      data.bio !== undefined ||
      data.avatarUrl !== undefined ||
      data.avatarPublicId !== undefined
    ) {
      if (data.address !== undefined) profileFields.address = data.address;
      if (data.bio !== undefined) profileFields.bio = data.bio;
      if (data.avatarUrl !== undefined) profileFields.avatarUrl = data.avatarUrl;
      if (data.avatarPublicId !== undefined) profileFields.avatarPublicId = data.avatarPublicId;

      await tx.userProfileDetail.create({
        data: {
          userId: customer.id,
          ...profileFields
        }
      });
    }

    return customer;
  });

  return result;
};

/**
 * Update an existing Customer user.
 * @param {string} customerId - The ID of the customer to update.
 * @param {object} data - The customer data to update.
 * @returns {object} The updated customer user.
 */
export const updateCustomer = async (customerId, data) => {
  if (!customerId) throw new Error("Customer ID is required");

  // Make sure the user is a customer
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: { id: true, role: { select: { name: true } } }
  });
  if (!customer) {
    throw new Error("Customer not found");
  }
  if (customer.role.name !== "Customer") {
    throw new Error("User is not a customer");
  }

  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser && existingUser.id !== customerId) {
      throw new Error("Email already in use.");
    }
  }

  if (typeof data.isActive === "string") {
    data.isActive = data.isActive === "true";
  }

  // Prevent changing roleId through this update
  const {
    roleId,
    address,
    bio,
    avatarUrl,
    avatar,
    avatarPublicId,
    ...safeData
  } = data;

  const result = await prisma.$transaction(async (tx) => {
    // Update the customer in User table
    const updatedCustomer = await tx.user.update({
      where: { id: customerId },
      data: safeData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        gender: true,
        roleId: true,
        createdAt: true,
        userProfileDetails: true
      },
    });

    // Handle profile fields separately
    const profileFields = {};
    if (address !== undefined) profileFields.address = address;
    if (bio !== undefined) profileFields.bio = bio;
    if (avatarUrl !== undefined) profileFields.avatarUrl = avatarUrl;
    if (avatarPublicId !== undefined) profileFields.avatarPublicId = avatarPublicId;

    if (Object.keys(profileFields).length > 0) {
      const existingProfile = await tx.userProfileDetail.findFirst({
        where: { userId: customerId },
        select: { id: true, userId: true }
      });

      if (existingProfile) {
        await tx.userProfileDetail.update({
          where: { id: existingProfile.id },
          data: profileFields,
        });
      } else {
        await tx.userProfileDetail.create({
          data: {
            userId: customerId,
            ...profileFields,
          },
        });
      }
    }

    const updatedCustomerData = await tx.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        gender: true,
        roleId: true,
        createdAt: true,
        userProfileDetails: true
      },
    });

    return updatedCustomerData;
  });

  return result;
};

/**
 * Delete a Customer user.
 * @param {string} customerId - The ID of the customer to delete.
 * @returns {object} The deleted customer user.
 */

export const deleteCustomer = async (customerId) => {
  if (!customerId) throw new Error("Customer ID is required");

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: { id: true, role: { select: { name: true } } }
  });
  if (!customer) throw new Error("Customer not found");
  if (customer.role.name !== "Customer") throw new Error("User is not a customer");

  const deletedCustomer = await prisma.$transaction(async (tx) => {
    // Get all conversations to delete messages first
    const conversations = await tx.chatConversation.findMany({
      where: { customerId },
      select: { conversationId: true }
    });
    const conversationIds = conversations.map((c) => c.conversationId);

    // Delete chat messages first (before conversations)
    if (conversationIds.length > 0) {
      await tx.chatMessage.deleteMany({
        where: { conversationId: { in: conversationIds } }
      });
    }

    // Delete all related records
    await tx.chatConversation.deleteMany({ where: { customerId } });
    await tx.chatMessage.deleteMany({ where: { senderId: customerId } });
    await tx.chatMessage.deleteMany({ where: { receiverId: customerId } });
    await tx.trainerRequest.deleteMany({ where: { customerId } });
    await tx.assignedCustomer.deleteMany({ where: { customerId } });
    await tx.trainerBooking.deleteMany({ where: { customerId } });
    await tx.userDevice.deleteMany({ where: { userId: customerId } });
    await tx.userProfileDetail.deleteMany({ where: { userId: customerId } });
    await tx.notification.deleteMany({ where: { userId: customerId } });
    await tx.review.deleteMany({ where: { customerId } });
    await tx.customerQuestionaire.deleteMany({ where: { clientId: customerId } });
    await tx.trainerVideoAssignment.deleteMany({ where: { clientId: customerId } });
    await tx.journalEntry.deleteMany({ where: { userId: customerId } });

    // Now delete the user
    return await tx.user.delete({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        roleId: true,
        createdAt: true,
      },
    });
  }, {
    timeout: 15000
  });

  return deletedCustomer;
};


/**
 * Get the profile data for a specific Customer.
 * @param {string} customerId - The ID of the customer.
 * @returns {object} The customer's profile data.
 */
export const showCustomerProfileData = async (customerId) => {
  if (!customerId) throw new Error("Customer ID is required");

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      roleId: true,
      gender: true,
      createdAt: true,
      assignedCustomersAsCustomer: {
        select: {
          id: true,
          trainerId: true,
          isActive: true,
          startDate: true,
          endDate: true,
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        }
      },
      userProfileDetails: true,
    }
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Optionally, format goals array to flatten or format as needed
  return {
    ...customer,
    goals: customer.goals ? customer.goals.map(g => ({
      id: g.id,
      text: g.text,
      createdAt: g.createdAt
    })) : []
  };
};


/**
 * Apply for a User Personal Trainer (UPT).
 * Creates an entry in the TrainerRequest table and sends notification to admins.
 * @param {object} data - { customerId: string, trainerId: string, message?: string }
 * @returns {object} The created TrainerRequest record.
 */
export const applyForUPT = async (data) => {
  try {
    const { customerId, trainerId, message } = data || {};

    if (!customerId) throw new Error("customerId is required");
    if (!trainerId) throw new Error("trainerId is required");

    // Confirm customer and trainer exist
    const [customer, trainer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: customerId },
        select: { id: true, role: { select: { name: true } } },
      }),
      prisma.user.findUnique({
        where: { id: trainerId },
        select: { id: true, role: { select: { name: true } } },
      }),
    ]);

    if (!customer || customer.role?.name !== "Customer") {
      throw new Error("Customer not found or not a customer");
    }
    if (!trainer || trainer.role?.name !== "Trainer") {
      throw new Error("Trainer not found or not a trainer");
    }

    // Check if there's already a pending request for this customer-trainer pair
    const existing = await prisma.trainerRequest.findFirst({
      where: {
        customerId,
        trainerId,
        status: "PENDING",
      },
    });
    if (existing) {
      throw new Error("A pending trainer request already exists for this customer and trainer.");
    }

    // Create TrainerRequest entry
    const trainerRequest = await prisma.trainerRequest.create({
      data: {
        customerId,
        trainerId,
        message,
        status: "PENDING",
      },
    });

    // TODO: need to uncommet later

    // await sendTrainerRequestNotification(trainerRequest.id, { customerId, trainerId, message });

    return trainerRequest;
  } catch (error) {
    throw error;
  }
};