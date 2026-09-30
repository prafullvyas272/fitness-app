import express from "express";
import {
  createTrainerWorkoutPlanHandler,
  getTrainerWorkoutPlansHandler,
  getTrainerWorkoutPlanDetailHandler,
  getPremiumWorkoutPlansForCustomerHandler,
  getPremiumWorkoutPlanDetailForCustomerHandler,
} from "../controllers/trainerWorkout.controller.js";
import {
  logExerciseSetsHandler,
  getCustomerPlanSetLogsHandler,
  getTrainerPlanSetLogsHandler,
} from "../controllers/exercise-set-log.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Customer routes — defined first to avoid conflict with /:customerId param
router.get("/customer/plans", authMiddleware, getPremiumWorkoutPlansForCustomerHandler);
router.get("/customer/plans/:planId", authMiddleware, getPremiumWorkoutPlanDetailForCustomerHandler);
router.get("/customer/plans/:planId/set-logs", authMiddleware, getCustomerPlanSetLogsHandler);
router.post("/customer/exercise/:exerciseId/log-sets", authMiddleware, logExerciseSetsHandler);

// Trainer routes
router.post("/:customerId", authMiddleware, createTrainerWorkoutPlanHandler);
router.get("/my-plans", authMiddleware, getTrainerWorkoutPlansHandler);
router.get("/my-plans/:planId", authMiddleware, getTrainerWorkoutPlanDetailHandler);
router.get("/my-plans/:planId/set-logs", authMiddleware, getTrainerPlanSetLogsHandler);

export default router;
