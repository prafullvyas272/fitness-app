import express from "express";
import {
  createCustomerWorkoutPlanHandler,
  getCustomerWorkoutPlansHandler,
  getCustomerWorkoutPlanDetailHandler,
} from "../controllers/customer-workout.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createCustomerWorkoutPlanHandler);
router.get("/", authMiddleware, getCustomerWorkoutPlansHandler);
router.get("/:planId", authMiddleware, getCustomerWorkoutPlanDetailHandler);

export default router;
