import { da } from "zod/locales";
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

const getTodayRange = () => {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

//add steps

export const addSteps = async (userId, steps) => {
  return await prisma.stepEntry.create({
    data: {
      userId,
      steps,
      date: new Date(),
    },
  });
};

export const getTodaySteps = async (userId) => {
  const { start, end } = getTodayRange();
  const entries = await prisma.stepEntry.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const totalSteps = entries.reduce((seum, e) => seum + e.steps, 0);
  return totalSteps;
};
