import prisma from "../utils/prisma.js";

export const createMealService = async (userId, data) => {
  return await prisma.mealLog.create({
    data: {
      customerId: userId,
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

export const getMealsService = async (userId, query) => {
  return await prisma.mealLog.findMany({
    where: {
      customerId: userId,
      ...(query.day && { day: query.day })
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const updateMealService = async (id, data) => {
  return await prisma.mealLog.update({
    where: { id },
    data
  });
};

export const getMealByIdService = async (userId, mealId) => {
  return await prisma.mealLog.findFirst({
    where: {
      id: mealId,
      customerId: userId
    }
  });
};