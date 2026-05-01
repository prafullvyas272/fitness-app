import prisma from "../utils/prisma.js";

// helper: returns active weight goal for a user (free or premium)
export const getActiveWeightGoal = async (userId) => {
  const freeGoal = await prisma.weightGoal.findUnique({ where: { userId } });
  if (freeGoal && !freeGoal.isCompleted) {
    return { type: "FREE", goal: freeGoal };
  }

  const premiumGoal = await prisma.premiumWeightGoal.findFirst({
    where: { customerId: userId, isStarted: true, isCompleted: false },
  });
  if (premiumGoal) {
    return { type: "PREMIUM", goal: premiumGoal };
  }

  return null;
};

// trainer creates weight goal for customer
export const createPremiumWeightGoal = async ({ trainerId, customerId, goal, weightGoalType, reminder, notify }) => {
  if (!goal || goal <= 0) throw new Error("Goal must be greater than 0");

  const existing = await prisma.premiumWeightGoal.findFirst({
    where: { customerId, isCompleted: false },
  });
  if (existing) throw new Error("Customer already has an active or pending premium weight goal.");

  return prisma.premiumWeightGoal.create({
    data: { trainerId, customerId, goal, weightGoalType: weightGoalType ?? "LOSE", reminder, notify: notify ?? true },
  });
};

// trainer views the goal they created for a customer
export const getTrainerPremiumWeightGoal = async (trainerId, customerId) => {
  return prisma.premiumWeightGoal.findFirst({
    where: { trainerId, customerId },
    orderBy: { createdAt: "desc" },
  });
};

// customer views their pending/active premium weight goal
export const getCustomerPremiumWeightGoal = async (customerId) => {
  return prisma.premiumWeightGoal.findFirst({
    where: { customerId, isCompleted: false },
    orderBy: { createdAt: "desc" },
  });
};

// customer starts their premium weight goal
export const startPremiumWeightGoal = async (customerId) => {
  const freeGoal = await prisma.weightGoal.findUnique({ where: { userId: customerId } });
  if (freeGoal && !freeGoal.isCompleted) {
    throw new Error("You have an active free weight goal. Finish it before starting your trainer's goal.");
  }

  const alreadyStarted = await prisma.premiumWeightGoal.findFirst({
    where: { customerId, isStarted: true, isCompleted: false },
  });
  if (alreadyStarted) throw new Error("You already have an active premium weight goal.");

  const pending = await prisma.premiumWeightGoal.findFirst({
    where: { customerId, isStarted: false, isCompleted: false },
    orderBy: { createdAt: "desc" },
  });
  if (!pending) throw new Error("No pending premium weight goal found.");

  return prisma.premiumWeightGoal.update({
    where: { id: pending.id },
    data: { isStarted: true },
  });
};

// customer finishes their currently active weight goal (free or premium)
export const finishActiveWeightGoal = async (userId) => {
  const active = await getActiveWeightGoal(userId);
  if (!active) throw new Error("No active weight goal found.");

  if (active.type === "FREE") {
    return prisma.weightGoal.update({
      where: { userId },
      data: { isCompleted: true },
    });
  }

  return prisma.premiumWeightGoal.update({
    where: { id: active.goal.id },
    data: { isCompleted: true },
  });
};
