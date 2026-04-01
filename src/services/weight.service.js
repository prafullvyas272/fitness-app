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

// ✅ Add weight entry
export const addWeightEntry = async (userId, weight) => {
  return await prisma.weightEntry.create({
    data: {
      userId,
      weight,
      date: new Date(),
    },
  });
};

// ✅ Get latest weight (current weight)
export const getCurrentWeight = async (userId) => {
  const entry = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return entry?.weight || null;
};

// ✅ Get goal (already exists but keeping clean)
export const getWeightGoal = async (userId) => {
  return await prisma.weightGoal.findUnique({
    where: { userId },
  });
};