import express from "express";
import {
  createPremiumStepGoalHandler,
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

// trainer route
router.post("/:customerId", authMiddleware, createPremiumStepGoalHandler);

export default router;
