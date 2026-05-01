import express from "express";
import {
  createPremiumStepGoalHandler,
  getTrainerPremiumStepGoalHandler,
  getCustomerPremiumStepGoalHandler,
  startPremiumStepGoalHandler,
  finishActiveStepGoalHandler,
} from "../controllers/premium-steps.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// customer routes first to avoid conflict with /:customerId
router.get("/customer/goal", authMiddleware, getCustomerPremiumStepGoalHandler);
router.post("/customer/start", authMiddleware, startPremiumStepGoalHandler);
router.post("/customer/finish", authMiddleware, finishActiveStepGoalHandler);

// trainer routes
router.post("/:customerId", authMiddleware, createPremiumStepGoalHandler);
router.get("/:customerId", authMiddleware, getTrainerPremiumStepGoalHandler);

export default router;
