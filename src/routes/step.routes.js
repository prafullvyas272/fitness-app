import express from "express";
import { saveStepGoal, getSteps, addUserSteps, getStepsProgress, getWeeklyProgress, updateStepGoal } from "../controllers/step.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveStepGoal);
router.put("/", authMiddleware, saveStepGoal);
router.get("/", authMiddleware, getSteps);
router.patch("/", authMiddleware, updateStepGoal); 

router.post("/add", authMiddleware, addUserSteps);
router.get("/progress", authMiddleware, getStepsProgress);
router.get("/weekly", authMiddleware, getWeeklyProgress);

export default router;