import prisma from "../utils/prisma.js";

export const createOrUpdateStepGoal = async (userId, data) => {
  const { goal, reminder } = data;

  const existing = await prisma.stepGoal.findUnique({
    where: { userId },
  });

  if (existing) {
    return await prisma.stepGoal.update({
      where: { userId },
      data: { goal, reminder },
    });
  }

  return await prisma.stepGoal.create({
    data: {
      userId,
      goal,
      reminder,
    },
  });
};

export const getStepGoal = async (userId) => {
  return await prisma.stepGoal.findUnique({
    where: { userId },
  });
};