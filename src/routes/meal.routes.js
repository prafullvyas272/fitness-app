import express from "express";
import {
  addMeal,
  getMeals,
  updateMeal
} from "../controllers/meal.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, addMeal);
router.get("/", authMiddleware, getMeals);
router.patch("/:id", authMiddleware, updateMeal);

router.get("/:id", authMiddleware, getMeals);

export default router;