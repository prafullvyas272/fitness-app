import express from "express";
import { saveWeightGoal, getWeight, updateWeight, getCurrentWeightData, updateWeightGoal, getWeeklyWeightProgress, getWeightProgress } from "../controllers/weight.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveWeightGoal);
router.put("/", authMiddleware, saveWeightGoal);
router.get("/", authMiddleware, getWeight);
router.patch("/", authMiddleware, updateWeightGoal);

router.post("/update", authMiddleware, updateWeight);

router.get("/current", authMiddleware, getCurrentWeightData);
router.get("/weekly", authMiddleware, getWeeklyWeightProgress);
router.get("/progress", authMiddleware, getWeightProgress);

export default router;