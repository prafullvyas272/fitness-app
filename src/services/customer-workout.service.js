import prisma from "../utils/prisma.js";

export const createCustomerWorkoutPlan = async ({ customerId, planName, numberOfDays, days }) => {
  if (!customerId) throw new Error("customerId is required");
  if (!planName) throw new Error("planName is required");
  if (!numberOfDays || numberOfDays < 1 || numberOfDays > 7) throw new Error("numberOfDays must be between 1 and 7");
  if (!Array.isArray(days) || days.length === 0) throw new Error("days array is required");
  if (days.length !== numberOfDays) throw new Error(`days array must have exactly ${numberOfDays} entries`);

  const plan = await prisma.customerWorkoutPlan.create({
    data: {
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

export const getCustomerWorkoutPlans = async (customerId) => {
  if (!customerId) throw new Error("customerId is required");

  return prisma.customerWorkoutPlan.findMany({
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

export const getCustomerWorkoutPlanDetail = async (planId, customerId) => {
  if (!planId) throw new Error("planId is required");

  const plan = await prisma.customerWorkoutPlan.findUnique({
    where: { id: planId },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          exercises: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!plan) throw new Error("Workout plan not found.");
  if (plan.customerId !== customerId) throw new Error("Unauthorized.");

  return plan;
};
