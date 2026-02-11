import prisma from "../utils/prisma.js";

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
  if (!data.email || !data.password) {
    throw new Error("Email and password are required.");
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });
  if (existing) {
    throw new Error("Email already in use.");
  }

  const customer = await prisma.user.create({
    data: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email,
      phone: data.phone || null,
      password: data.password, // Assume password is already hashed at higher layer/middleware
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
      roleId: true,
      createdAt: true,
    },
  });
  return customer;
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

  // Prevent changing roleId through this update
  const { roleId, ...safeData } = data;

  const updatedCustomer = await prisma.user.update({
    where: { id: customerId },
    data: safeData,
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

  return updatedCustomer;
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
      createdAt: true,
      assignedTrainersAsCustomer: {
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
      goals: {
        select: {
          id: true,
          text: true,
          createdAt: true
        }
      }
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