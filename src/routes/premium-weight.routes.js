import express from "express";
import {
  createPremiumWeightGoalHandler,
  getTrainerPremiumWeightGoalHandler,
  getCustomerPremiumWeightGoalHandler,
  startPremiumWeightGoalHandler,
  finishActiveWeightGoalHandler,
} from "../controllers/premium-weight.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// customer routes first to avoid conflict with /:customerId
router.get("/customer/goal", authMiddleware, getCustomerPremiumWeightGoalHandler);
router.post("/customer/start", authMiddleware, startPremiumWeightGoalHandler);
router.post("/customer/finish", authMiddleware, finishActiveWeightGoalHandler);

// trainer routes
router.post("/:customerId", authMiddleware, createPremiumWeightGoalHandler);
router.get("/:customerId", authMiddleware, getTrainerPremiumWeightGoalHandler);

export default router;
