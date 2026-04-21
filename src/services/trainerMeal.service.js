import prisma from "../utils/prisma.js";

export const createTrainerMealService = async (
  trainerId,
  customerId,
  data
) => {
  return await prisma.trainerMealPlan.create({
    data: {
      trainerId,
      customerId,
      day: data.day,
      mealType: data.mealType,
      mealName: data.mealName,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      notes: data.notes
    }
  });
};

export const getTrainerCustomerMealsService = async (
  trainerId,
  customerId
) => {
  return await prisma.trainerMealPlan.findMany({
    where: {
      trainerId,
      customerId
    },
    orderBy: {
      createdAt: "asc"
    }
  });
};

export const updateTrainerMealService = async (
  trainerId,
  mealId,
  data
) => {
  return await prisma.trainerMealPlan.updateMany({
    where: {
      id: mealId,
      trainerId
    },
    data
  });
};

export const deleteTrainerMealService = async (
  trainerId,
  mealId
) => {
  return await prisma.trainerMealPlan.deleteMany({
    where: {
      id: mealId,
      trainerId
    }
  });
};

export const getCustomerPremiumMealsService = async (
  customerId
) => {
  return await prisma.trainerMealPlan.findMany({
    where: {
      customerId
    },
    orderBy: {
      createdAt: "asc"
    }
  });
};