import prisma from "../utils/prisma.js";

// helper: returns most recently completed goal (free or premium)
export const getLastCompletedStepGoal = async (userId) => {
  const freeGoal = await prisma.stepGoal.findUnique({ where: { userId } });
  const premiumGoal = await prisma.premiumStepGoal.findFirst({
    where: { customerId: userId, isCompleted: true },
    orderBy: { updatedAt: "desc" },
  });

  const free = freeGoal?.isCompleted ? freeGoal : null;

  if (free && premiumGoal) {
    return free.updatedAt >= premiumGoal.updatedAt
      ? { type: "FREE", goal: free }
      : { type: "PREMIUM", goal: premiumGoal };
  }
  if (premiumGoal) return { type: "PREMIUM", goal: premiumGoal };
  if (free) return { type: "FREE", goal: free };
  return null;
};

// helper: returns active goal for a user (free or premium)
export const getActiveStepGoal = async (userId) => {
  const freeGoal = await prisma.stepGoal.findUnique({ where: { userId } });
  if (freeGoal && !freeGoal.isCompleted) {
    return { type: "FREE", goal: freeGoal };
  }

  const premiumGoal = await prisma.premiumStepGoal.findFirst({
    where: { customerId: userId, isStarted: true, isCompleted: false },
  });
  if (premiumGoal) {
    return { type: "PREMIUM", goal: premiumGoal };
  }

  return null;
};

// trainer creates step goal for customer
export const createPremiumStepGoal = async ({ trainerId, customerId, goal, reminder, notify }) => {
  if (!goal || goal <= 0) throw new Error("Goal must be greater than 0");

  // block if customer already has a pending/active premium step goal
  const existing = await prisma.premiumStepGoal.findFirst({
    where: { customerId, isCompleted: false },
  });
  if (existing) throw new Error("Customer already has an active or pending premium step goal.");

  return prisma.premiumStepGoal.create({
    data: { trainerId, customerId, goal, reminder, notify: notify ?? true },
  });
};

// customer views their pending/active premium step goal
export const getCustomerPremiumStepGoal = async (customerId) => {
  return prisma.premiumStepGoal.findFirst({
    where: { customerId, isCompleted: false },
    orderBy: { createdAt: "desc" },
  });
};

// trainer views the goal they created for a customer
export const getTrainerPremiumStepGoal = async (trainerId, customerId) => {
  return prisma.premiumStepGoal.findFirst({
    where: { trainerId, customerId },
    orderBy: { createdAt: "desc" },
  });
};

// customer starts their premium step goal
export const startPremiumStepGoal = async (customerId) => {
  // block if free goal is still active
  const freeGoal = await prisma.stepGoal.findUnique({ where: { userId: customerId } });
  if (freeGoal && !freeGoal.isCompleted) {
    throw new Error("You have an active free step goal. Finish it before starting your trainer's goal.");
  }

  // block if a premium goal is already started
  const alreadyStarted = await prisma.premiumStepGoal.findFirst({
    where: { customerId, isStarted: true, isCompleted: false },
  });
  if (alreadyStarted) throw new Error("You already have an active premium step goal.");

  const pending = await prisma.premiumStepGoal.findFirst({
    where: { customerId, isStarted: false, isCompleted: false },
    orderBy: { createdAt: "desc" },
  });
  if (!pending) throw new Error("No pending premium step goal found.");

  return prisma.premiumStepGoal.update({
    where: { id: pending.id },
    data: { isStarted: true, startedAt: new Date() },
  });
};

// customer finishes their currently active step goal (free or premium)
export const finishActiveStepGoal = async (userId) => {
  const active = await getActiveStepGoal(userId);
  if (!active) throw new Error("No active step goal found.");

  if (active.type === "FREE") {
    return prisma.stepGoal.update({
      where: { userId },
      data: { isCompleted: true },
    });
  }

  return prisma.premiumStepGoal.update({
    where: { id: active.goal.id },
    data: { isCompleted: true },
  });
};
