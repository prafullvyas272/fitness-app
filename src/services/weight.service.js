import { DownscopedClient } from "google-auth-library";
import prisma from "../utils/prisma.js";

export const createOrUpdateWeightGoal = async (userId, data) => {
  const { goal, reminder, notify } = data;  // ✅ added notify

  const existing = await prisma.weightGoal.findUnique({
    where: { userId },
  });

  if (existing) {
    return await prisma.weightGoal.update({
      where: { userId },
      data: { goal, reminder, notify },  // ✅ added notify
    });
  }

  return await prisma.weightGoal.create({
    data: {
      userId,
      goal,
      reminder,
      notify,  // ✅ added notify
    },
  });
};

// ✅ PATCH — partial update
export const patchWeightGoal = async (userId, updates) => {
  const existing = await prisma.weightGoal.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error("Weight goal not found. Please create one first.");
  }

  return await prisma.weightGoal.update({
    where: { userId },
    data: updates,
  });
};

export const checkWeightGoal = async (userId, currentWeight) => {
  const goalData = await prisma.weightGoal.findUnique({
    where: { userId },
  });

  if (!goalData) return null;
  return currentWeight <= goalData.goal;
};

export const addWeightEntry = async (userId, weight) => {
  return await prisma.weightEntry.create({
    data: {
      userId,
      weight,
      date: new Date(),
    },
  });
};

export const getCurrentWeight = async (userId) => {
  const entry = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return entry?.weight || null;
};

export const getWeightGoal = async (userId) => {
  return await prisma.weightGoal.findUnique({
    where: { userId },
  });
};

// ✅ Last 7 days chart + best day + average
export const getLast7DaysWeightProgress = async (userId) => {
  const today = new Date();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return date;
  });

  const start = new Date(last7Days[0]);
  start.setHours(0, 0, 0, 0);

  const end = new Date(last7Days[6]);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.weightEntry.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: "asc" },
  });

  // Group by date — take latest entry per day (most recent log)
  const weightByDate = {};
  for (const entry of entries) {
    const key = entry.date.toISOString().split("T")[0];
    weightByDate[key] = entry.weight; // latest overwrites earlier same-day
  }

  // Build chart data
  const chartData = last7Days.map((date) => {
    const key = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dayName,
      date: key,
      weight: weightByDate[key] || null, // null = no entry that day
    };
  });

  // Best day = lowest weight logged (closest to goal)
  const daysWithData = chartData.filter((d) => d.weight !== null);

  const bestDay = daysWithData.length > 0
    ? daysWithData.reduce((best, cur) => cur.weight < best.weight ? cur : best)
    : null;

  // Average = sum of logged weights / number of logged days
  const average = daysWithData.length > 0
    ? Math.round(
        (daysWithData.reduce((sum, d) => sum + d.weight, 0) / daysWithData.length)
        * 10
      ) / 10  // round to 1 decimal e.g 72.4
    : null;


    //new goal
    const goalData = await prisma.weightGoal.findUnique({
      where: { userId },
    });

    const goal = goalData?.goal || null;

    //new progress
    let progresspercentage = 0;

    if (goal && daysWithData.length > 0) {
      const latest = daysWithData[daysWithData.length - 1].weight;
      progresspercentage = Math.min((latest / goal) * 100, 100);
    }

    //trend
    let trend = "stable";
    if (daysWithData.length > 2) {
      const first = daysWithData[0].weight;
      const last = daysWithData[daysWithData.length-1].weight;

      if (last < first) trend = "down";
      else if (last > first) trend = "up";
    }
      

  return {
    chartData,
    bestDay: bestDay
      ? { weight: bestDay.weight, day: bestDay.day, date: bestDay.date }
      : null,
    average,
    totalEntriesDays: daysWithData.length,

    goal,
    progresspercentage: Math.round(progresspercentage),
    trend,
  };
};