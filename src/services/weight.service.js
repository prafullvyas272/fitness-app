import prisma from "../utils/prisma.js";

export const createOrUpdateWeightGoal = async (userId, data) => {
  const { goal, reminder } = data;

  const existing = await prisma.weightGoal.findUnique({
    where: { userId },
  });

  if (existing) {
    return await prisma.weightGoal.update({
      where: { userId },
      data: { goal, reminder },
    });
  }

  return await prisma.weightGoal.create({
    data: {
      userId,
      goal,
      reminder,
    },
  });
};

export const getWeightGoal = async (userId) => {
  return await prisma.weightGoal.findUnique({
    where: { userId },
  });
};

export const checkWeightGoal = async (userId, currentWeight) => {
  const goalData = await prisma.weightGoal.findUnique({
    where: { userId },
  });

  if (!goalData) return null;

  if (currentWeight <= goalData.goal) {
    return true; // Goal achieved
  }

  return false; // Goal not yet achieved
};