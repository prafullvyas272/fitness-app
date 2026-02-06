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
      specialities: {
        select: { specialityId: true }
      }
    }
  });

  return trainers;
};
