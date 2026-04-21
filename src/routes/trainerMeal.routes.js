import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  createTrainerMeal,
  getTrainerCustomerMeals,
  updateTrainerMeal,
  deleteTrainerMeal,
  getCustomerPremiumMeals
} from "../controllers/trainerMeal.controller.js";

const router = express.Router();

// trainer
router.post("/:customerId", authMiddleware, createTrainerMeal);
router.get("/:customerId", authMiddleware, getTrainerCustomerMeals);
router.patch("/:mealId", authMiddleware, updateTrainerMeal);
router.delete("/:mealId", authMiddleware, deleteTrainerMeal);

// customer
router.get("/customer/my-plan/list", authMiddleware, getCustomerPremiumMeals);

export default router;