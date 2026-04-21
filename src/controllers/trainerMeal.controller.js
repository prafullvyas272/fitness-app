import {
  createTrainerMealService,
  getTrainerCustomerMealsService,
  updateTrainerMealService,
  deleteTrainerMealService,
  getCustomerPremiumMealsService
} from "../services/trainerMeal.service.js";

export const createTrainerMeal = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const customerId = req.params.customerId;

    const meal = await createTrainerMealService(
      trainerId,
      customerId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Meal created",
      data: meal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrainerCustomerMeals = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const customerId = req.params.customerId;

    const meals = await getTrainerCustomerMealsService(
      trainerId,
      customerId
    );

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTrainerMeal = async (req, res) => {
  try {
    const trainerId = req.user.userId;

    const meal = await updateTrainerMealService(
      trainerId,
      req.params.mealId,
      req.body
    );

    res.json({
      success: true,
      message: "Meal updated",
      data: meal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTrainerMeal = async (req, res) => {
  try {
    const trainerId = req.user.userId;

    await deleteTrainerMealService(
      trainerId,
      req.params.mealId
    );

    res.json({
      success: true,
      message: "Meal deleted"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerPremiumMeals = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const meals = await getCustomerPremiumMealsService(customerId);

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};