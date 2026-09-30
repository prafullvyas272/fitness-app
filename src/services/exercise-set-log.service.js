import prisma from "../utils/prisma.js";

const SET_FIELDS = ["set1", "set2", "set3", "set4", "set5", "set6"];

const normalizeDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Customer logs which sets they completed for one exercise, on one date.
 * Upserts — resubmitting the same exercise+date updates that day's log
 * instead of creating a duplicate.
 */
export const logExerciseSets = async (customerId, exerciseId, data) => {
  if (!customerId || !exerciseId) {
    throw new Error("customerId and exerciseId are required");
  }

  const exercise = await prisma.trainerWorkoutExercise.findUnique({
    where: { id: exerciseId },
    include: { day: { include: { plan: true } } },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }
  if (exercise.day.plan.customerId !== customerId) {
    throw new Error("Unauthorized - this exercise is not on your plan");
  }

  const date = normalizeDate(data.date);
  const setValues = {};
  for (const field of SET_FIELDS) {
    if (typeof data[field] === "boolean") {
      setValues[field] = data[field];
    }
  }

  const log = await prisma.exerciseSetLog.upsert({
    where: {
      exerciseId_customerId_date: { exerciseId, customerId, date },
    },
    update: setValues,
    create: {
      exerciseId,
      customerId,
      date,
      ...setValues,
    },
  });

  return log;
};

/**
 * Shared by both customer and trainer views: the full plan (days + exercises)
 * with each exercise's set-completion history nested under it.
 */
const getPlanWithSetLogs = async (planId) => {
  const plan = await prisma.trainerWorkoutPlan.findUnique({
    where: { id: planId },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          exercises: {
            orderBy: { createdAt: "asc" },
            include: {
              setLogs: { orderBy: { date: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!plan) {
    throw new Error("Workout plan not found.");
  }

  return plan;
};

export const getCustomerPlanSetLogs = async (planId, customerId) => {
  if (!planId) throw new Error("planId is required");

  const plan = await getPlanWithSetLogs(planId);
  if (plan.customerId !== customerId) {
    throw new Error("Unauthorized.");
  }

  return plan;
};

export const getTrainerPlanSetLogs = async (planId, trainerId) => {
  if (!planId) throw new Error("planId is required");

  const plan = await getPlanWithSetLogs(planId);
  if (plan.trainerId !== trainerId) {
    throw new Error("Unauthorized.");
  }

  return plan;
};
