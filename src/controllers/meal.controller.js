import {
  createMealService,
  getMealsService,
  updateMealService,
  getMealByIdService,
} from "../services/meal.service.js";

export const addMeal = async (req, res) => {
  try {
    const userId = req.user.userId;

    const meal = await createMealService(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Meal added successfully",
      data: meal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMeals = async (req, res) => {
  try {
    const userId = req.user.userId;

    const meals = await getMealsService(userId, req.query);

    res.status(200).json({
      success: true,
      data: meals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMeal = async (req, res) => {
  try {
    const meal = await updateMealService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Meal updated",
      data: meal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMealById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const mealId = req.params.id;

    const meal = await getMealByIdService(userId, mealId);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found"
      });
    }

    res.status(200).json({
      success: true,
      data: meal
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};