import prisma from "../utils/prisma.js";

/**
 * Get all Trainers
 * Returns an array of users with Trainer role.
 */
export const getAllTrainers = async () => {
  // First, get the roleId for the Trainer role
  const trainerRole = await prisma.role.findUnique({
    where: { name: 'Trainer' },
    select: { id: true }
  });
  if (!trainerRole) {
    throw new Error("Trainer role not found");
  }

  // Fetch all users with roleId matching Trainer
  const trainers = await prisma.user.findMany({
    where: { roleId: trainerRole.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
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
            }
          }
        },
      },
    }
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