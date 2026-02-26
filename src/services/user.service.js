import prisma from "../utils/prisma.js";

/**
 * Get all Trainers
 * Returns an array of users with Trainer role.
 */
export const getAllTrainers = async () => {
  // Get the Trainer roleId
  const trainerRole = await prisma.role.findUnique({
    where: { name: "Trainer" },
    select: { id: true },
  });
  if (!trainerRole) {
    throw new Error("Trainer role not found");
  }

  // Fetch all users with roleId matching Trainer, including assigned customers and profile details
  const trainers = await prisma.user.findMany({
    where: { roleId: trainerRole.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      isActive: true,
      gender: true,
      assignedCustomersAsTrainer: {
        select: {
          id: true,
          customerId: true,
          trainerId: true,
          isActive: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      userProfileDetails: {
        select: {
          id: true,
          address: true,
          bio: true,
          hostGymName: true,
          hostGymAddress: true,
          avatarUrl: true,
          dob: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return trainers;
};

/**
 * Get all Users
 * Returns an array of users with Trainer role.
 */
export const getAllCustomers = async () => {
    // First, get the roleId for the Trainer role
    const customerRole = await prisma.role.findUnique({
      where: { name: 'Customer' },
      select: { id: true }
    });
    if (!customerRole) {
      throw new Error("Customer role not found");
    }
  
    // Fetch all users with roleId matching Trainer
    // Get all users with role 'Customer' and include their assigned trainers
    const customers = await prisma.user.findMany({
      where: { roleId: customerRole.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        gender: true,
        isActive: true,
        userProfileDetails: {
          select: {
            id: true,
            address: true,
            bio: true,
            avatarUrl: true,
            dob: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        assignedCustomersAsCustomer: {
          select: {
            id: true,
            trainerId: true,
            isActive: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
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
        }
      }
    });
    return customers;
  };

/**
 * Method to assign a customer to trainer. 
 * @param {*} trainerId 
 * @param {*} customerId 
 * @returns 
 */
export const assignCustomer = async (trainerId, customerId) => {
  // Validate trainerId and customerId
  if (!trainerId || !customerId) {
    throw new Error("Both trainerId and customerId are required");
  }

  // Validate that trainerId exists in user table
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId }
  });
  if (!trainer) {
    throw new Error("Trainer not found");
  }

  // Validate that customerId exists in user table
  const customer = await prisma.user.findUnique({
    where: { id: customerId }
  });
  if (!customer) {
    throw new Error("Customer not found");
  }

  // Check for existing active assignment
  const existingAssignment = await prisma.assignedCustomer.findFirst({
    where: {
      trainerId: trainerId,
      customerId: customerId,
      isActive: true
    }
  });

  if (existingAssignment) {
    throw new Error("This customer is already assigned to this trainer");
  }

  const assignment = await prisma.assignedCustomer.create({
    data: {
      trainerId,
      customerId,
      isActive: true,
      startDate: new Date()
    }
  });

  return assignment;
};


/**
 * Toggle the isActive status for a user.
 * @param {string} userId - The ID of the user to update.
 * @param {boolean} isActive - The new isActive value to set.
 * @returns {object} The updated user object.
 */
export const toggleUserIsActive = async (userId, isActive) => {
  if (!userId || isActive === undefined) {
    throw new Error("userId and isActive are required");
  }
  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be a boolean");
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: isActive },
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

  return updatedUser;
};


/**
 * Unassign a customer from a trainer.
 * @param {string} trainerId - The ID of the trainer.
 * @param {string} customerId - The ID of the customer to unassign.
 * @returns {object} The updated assignment object.
 */
export const unassignCustomer = async (trainerId, customerId) => {
  if (!trainerId || !customerId) {
    throw new Error("Both trainerId and customerId are required");
  }

  const assignment = await prisma.assignedCustomer.findFirst({
    where: {
      trainerId,
      customerId,
      isActive: true
    }
  });

  if (!assignment) {
    throw new Error("Active assignment not found");
  }

  const deletedAssignment = await prisma.assignedCustomer.delete({
    where: { id: assignment.id },
  });


  return deletedAssignment;
};
