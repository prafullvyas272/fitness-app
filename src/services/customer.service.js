import prisma from "../utils/prisma.js";
import { getHashedPassword } from "../utils/password.js";

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

  // Prevent changing roleId through this update
  const {
    roleId,
    address,
    bio,
    avatarUrl,
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

  // Ensure user exists and is a customer
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

  // Delete the customer user
  const deletedCustomer = await prisma.user.delete({
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