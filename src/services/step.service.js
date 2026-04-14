import { da } from "zod/locales";
import prisma from "../utils/prisma.js";

export const createOrUpdateStepGoal = async (userId, data) => {
  const { goal, reminder, notify } = data;  // ✅ added notify

  const existing = await prisma.stepGoal.findUnique({
    where: { userId },
  });

  if (existing) {
    return await prisma.stepGoal.update({
      where: { userId },
      data: { goal, reminder, notify },  // ✅ added notify
    });
  }

  return await prisma.stepGoal.create({
    data: {
      userId,
      goal,
      reminder,
      notify,  // ✅ added notify
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

  return entries.reduce((sum, e) => sum + e.steps, 0);  // ✅ fixed typo "seum" → "sum"
};

export const getLast7DaysProgress = async (userId) => {
  const today = new Date();

  // Build last 7 days date array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i)); // Mon → Sun order
    return date;
  });

  // Fetch all step entries in last 7 days range
  const start = new Date(last7Days[0]);
  start.setHours(0, 0, 0, 0);

  const end = new Date(last7Days[6]);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.stepEntry.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  // Group steps by date
  const stepsByDate = {};
  for (const entry of entries) {
    const key = entry.date.toISOString().split("T")[0]; // "2026-04-14"
    stepsByDate[key] = (stepsByDate[key] || 0) + entry.steps;
  }

  // Build chart data for all 7 days
  const chartData = last7Days.map((date) => {
    const key = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue...
    return {
      day: dayName,
      date: key,
      steps: stepsByDate[key] || 0,
    };
  });

  // Best day calculation
  const bestDay = chartData.reduce(
    (best, current) => (current.steps > best.steps ? current : best),
    chartData[0]
  );

  // Average calculation (only days with steps OR all 7 days — your choice)
  const totalStepsSum = chartData.reduce((sum, d) => sum + d.steps, 0);
  const average = Math.round(totalStepsSum / 7);

  return {
    chartData,
    bestDay: {
      steps: bestDay.steps,
      day: bestDay.day,
      date: bestDay.date,
    },
    average,
  };
};

export const patchStepGoal = async (userId, updates) => {
  const existing = await prisma.stepGoal.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error("Step goal not found. Please create one first.");
  }

  return await prisma.stepGoal.update({
    where: { userId },
    data: updates,   // only updates fields passed, rest stay same
  });
};