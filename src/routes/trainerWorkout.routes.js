import express from "express";
import {
  createTrainerWorkoutPlanHandler,
  getTrainerWorkoutPlansHandler,
  getTrainerWorkoutPlanDetailHandler,
  getPremiumWorkoutPlansForCustomerHandler,
  getPremiumWorkoutPlanDetailForCustomerHandler,
} from "../controllers/trainerWorkout.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Customer routes — defined first to avoid conflict with /:customerId param
router.get("/customer/plans", authMiddleware, getPremiumWorkoutPlansForCustomerHandler);
router.get("/customer/plans/:planId", authMiddleware, getPremiumWorkoutPlanDetailForCustomerHandler);

// Trainer routes
router.post("/:customerId", authMiddleware, createTrainerWorkoutPlanHandler);
router.get("/my-plans", authMiddleware, getTrainerWorkoutPlansHandler);
router.get("/my-plans/:planId", authMiddleware, getTrainerWorkoutPlanDetailHandler);

export default router;
