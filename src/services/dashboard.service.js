import prisma from "../utils/prisma.js";
import { getActiveStepGoal } from "./premium-steps.service.js";
import { getActiveWeightGoal } from "./premium-weight.service.js";

// 👉 get today range
const getTodayRange = () => {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getLastCompletedStepGoal = async (userId) => {
  const freeGoal = await prisma.stepGoal.findUnique({ where: { userId } });
  if (freeGoal?.isCompleted) return { type: "FREE", goal: freeGoal };

  const premiumGoal = await prisma.premiumStepGoal.findFirst({
    where: { customerId: userId, isCompleted: true },
    orderBy: { createdAt: "desc" },
  });
  if (premiumGoal) return { type: "PREMIUM", goal: premiumGoal };

  return null;
};

// ✅ Steps Data
export const getStepsDashboard = async (userId) => {
  const { start, end } = getTodayRange();

  const entries = await prisma.stepEntry.findMany({
    where: { userId, date: { gte: start, lte: end } },
  });

  const totalSteps = entries.reduce((sum, e) => sum + e.steps, 0);

  const active = await getActiveStepGoal(userId);
  const fallback = active ? null : await getLastCompletedStepGoal(userId);
  const source = active ?? fallback;
  const goalData = source?.goal || null;
  const goal = goalData?.goal || 0;
  const percentage = goal > 0 ? Math.min((totalSteps / goal) * 100, 100) : 0;

  return {
    steps: totalSteps,
    goal,
    percentage: Math.round(percentage),
    notify: goalData?.notify ?? true,
    reminder: goalData?.reminder || null,
    goalType: source?.type || null,
    isCompleted: goalData?.isCompleted ?? false,
  };
};

const getLastCompletedWeightGoal = async (userId) => {
  const freeGoal = await prisma.weightGoal.findUnique({ where: { userId } });
  if (freeGoal?.isCompleted) return { type: "FREE", goal: freeGoal };

  const premiumGoal = await prisma.premiumWeightGoal.findFirst({
    where: { customerId: userId, isCompleted: true },
    orderBy: { createdAt: "desc" },
  });
  if (premiumGoal) return { type: "PREMIUM", goal: premiumGoal };

  return null;
};

// ✅ Weight Data
export const getWeightDashboard = async (userId) => {
  const latestWeight = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const active = await getActiveWeightGoal(userId);
  const fallback = active ? null : await getLastCompletedWeightGoal(userId);
  const source = active ?? fallback;
  const goalData = source?.goal || null;
  const goal = goalData?.goal || null;
  const current = latestWeight?.weight || null;

  let percentage = 0;
  if (current !== null && goal !== null && goal > 0) {
    percentage = Math.min((current / goal) * 100, 100);
  }

  return {
    current,
    goal,
    percentage: Math.round(percentage),
    notify: goalData?.notify ?? true,
    reminder: goalData?.reminder || null,
    goalType: source?.type || null,
    isCompleted: goalData?.isCompleted ?? false,
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