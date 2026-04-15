import prisma from "../utils/prisma.js";

// 👉 get today range
const getTodayRange = () => {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// ✅ Steps Data
export const getStepsDashboard = async (userId) => {
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

  const totalSteps = entries.reduce((sum, e) => sum + e.steps, 0);

  const goalData = await prisma.stepGoal.findUnique({
    where: { userId },
  });

  const goal = goalData?.goal || 0;

  const percentage = goal > 0
    ? Math.min((totalSteps / goal) * 100, 100)
    : 0;

  return {
    steps: totalSteps,
    goal,
    percentage: Math.round(percentage),

    notify: goalData?.notify || true, // include notify flag
    reminder: goalData?.reminder || null, // include reminder time
  };
};

// ✅ Weight Data
export const getWeightDashboard = async (userId) => {
  const latestWeight = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const goalData = await prisma.weightGoal.findUnique({
    where: { userId },
  });

  const current = latestWeight?.weight || null;
  const goal = goalData?.goal || null;

  let percentage = 0;
  if (current !== null && goal !== null && goal > 0) {
    percentage = Math.min((current / goal) * 100, 100);
  }

  return {
    current: latestWeight?.weight || null,
    goal: goalData?.goal || null,
    percentage: Math.round(percentage),

    notify: goalData?.notify || true, // include notify flag
    reminder: goalData?.reminder || null, // include reminder time
  };
};

// ✅ Recent Journals
export const getRecentJournals = async (userId) => {
  return await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      note: true,
      createdAt: true,
    },
  });
};