import express from "express";
import { saveStepGoal, getSteps } from "../controllers/step.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveStepGoal);
router.put("/", authMiddleware, saveStepGoal);
router.get("/", authMiddleware, getSteps);

export default router;