import express from "express";
import { saveWeightGoal, getWeight, updateWeight } from "../controllers/weight.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveWeightGoal);
router.put("/", authMiddleware, saveWeightGoal);
router.get("/", authMiddleware, getWeight);

router.post("/update", authMiddleware, updateWeight);

export default router;