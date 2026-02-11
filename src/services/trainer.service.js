import prisma from "../utils/prisma.js";

/**
 * Create a new Trainer user.
 * @param {object} data - User data for trainer creation.
 * @returns {object} The created trainer user.
 */
export const createTrainer = async (data) => {
  // Ensure roleId is for Trainer
  const trainerRole = await prisma.role.findUnique({
    where: { name: 'Trainer' },
    select: { id: true }
  });
  if (!trainerRole) {
    throw new Error("Trainer role not found");
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

  const trainer = await prisma.user.create({
    data: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email,
      phone: data.phone || null,
      password: data.password, // Assume password is already hashed at higher layer/middleware
      roleId: trainerRole.id,
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
  return trainer;
};

/**
 * Update an existing Trainer user.
 * @param {string} trainerId - The ID of the trainer to update.
 * @param {object} data - The trainer data to update.
 * @returns {object} The updated trainer user.
 */
export const updateTrainer = async (trainerId, data) => {
  if (!trainerId) throw new Error("Trainer ID is required");

  // Make sure the user is a trainer
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: { id: true, role: { select: { name: true } } }
  });
  if (!trainer) {
    throw new Error("Trainer not found");
  }
  if (trainer.role.name !== "Trainer") {
    throw new Error("User is not a trainer");
  }

  // Prevent changing roleId through this update
  const { roleId, ...safeData } = data;

  const updatedTrainer = await prisma.user.update({
    where: { id: trainerId },
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

  return updatedTrainer;
};

/**
 * Delete a Trainer user.
 * @param {string} trainerId - The ID of the trainer to delete.
 * @returns {object} The deleted trainer user.
 */
export const deleteTrainer = async (trainerId) => {
  if (!trainerId) throw new Error("Trainer ID is required");

  // Ensure user exists and is a trainer
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: { id: true, role: { select: { name: true } } }
  });
  if (!trainer) {
    throw new Error("Trainer not found");
  }
  if (trainer.role.name !== "Trainer") {
    throw new Error("User is not a trainer");
  }

  // Delete the trainer user
  const deletedTrainer = await prisma.user.delete({
    where: { id: trainerId },
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

  return deletedTrainer;
};

/**
 * Get the profile data for a specific Trainer.
 * @param {string} trainerId - The ID of the trainer.
 * @returns {object} The trainer's profile data.
 */
export const showTrainerProfileData = async (trainerId) => {
  if (!trainerId) throw new Error("Trainer ID is required");

  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      roleId: true,
      createdAt: true,
      assignedCustomersAsTrainer: {
        select: {
          id: true,
          customerId: true,
          isActive: true,
          startDate: true,
          endDate: true,
          customer: {
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
      specialities: {
        select: {
          specialityId: true
        }
      }
    }
  });

  if (!trainer) {
    throw new Error("Trainer not found");
  }

  // Optionally, format specialities array to flatten
  return {
    ...trainer,
    specialities: trainer.specialities ? trainer.specialities.map(s => ({ specialityId: s.specialityId })) : []
  };
};