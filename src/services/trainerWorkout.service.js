import prisma from "../utils/prisma.js";

export const createTrainerWorkoutPlan = async ({ trainerId, customerId, planName, numberOfDays, days }) => {
  if (!trainerId) throw new Error("trainerId is required");
  if (!customerId) throw new Error("customerId is required");
  if (!planName) throw new Error("planName is required");
  if (!numberOfDays || numberOfDays < 1 || numberOfDays > 7) throw new Error("numberOfDays must be between 1 and 7");
  if (!Array.isArray(days) || days.length === 0) throw new Error("days array is required");
  if (days.length !== numberOfDays) throw new Error(`days array must have exactly ${numberOfDays} entries`);

  const plan = await prisma.trainerWorkoutPlan.create({
    data: {
      trainerId,
      customerId,
      planName,
      numberOfDays,
      days: {
        create: days.map((day) => ({
          dayNumber: day.dayNumber,
          exercises: {
            create: (day.exercises || []).map((ex) => ({
              exerciseName: ex.exerciseName,
              sets: ex.sets ?? null,
              reps: ex.reps ?? null,
              weight: ex.weight ?? null,
            })),
          },
        })),
      },
    },
    include: {
      days: {
        include: { exercises: true },
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  return plan;
};

// Trainer: get all their own plans
export const getTrainerWorkoutPlans = async (trainerId) => {
  if (!trainerId) throw new Error("trainerId is required");

  return prisma.trainerWorkoutPlan.findMany({
    where: { trainerId },
    select: {
      id: true,
      planName: true,
      numberOfDays: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Trainer: get detail of one plan
export const getTrainerWorkoutPlanDetail = async (planId, trainerId) => {
  if (!planId) throw new Error("planId is required");

  const plan = await prisma.trainerWorkoutPlan.findUnique({
    where: { id: planId },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          exercises: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!plan) throw new Error("Workout plan not found.");
  if (plan.trainerId !== trainerId) throw new Error("Unauthorized.");

  return plan;
};

// Customer: get all premium plans assigned to them
export const getPremiumWorkoutPlansForCustomer = async (customerId) => {
  if (!customerId) throw new Error("customerId is required");

  return prisma.trainerWorkoutPlan.findMany({
    where: { customerId },
    select: {
      id: true,
      planName: true,
      numberOfDays: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Customer: get detail of a specific premium plan assigned to them
export const getPremiumWorkoutPlanDetailForCustomer = async (planId, customerId) => {
  if (!planId) throw new Error("planId is required");

  const plan = await prisma.trainerWorkoutPlan.findUnique({
    where: { id: planId },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          exercises: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!plan) throw new Error("Workout plan not found.");
  if (plan.customerId !== customerId) throw new Error("Unauthorized.");

  return plan;
};
