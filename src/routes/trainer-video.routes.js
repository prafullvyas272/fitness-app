import express from "express";
import { addTrainerVideoHandler, getClientVideosHandler } from "../controllers/trainer-video.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Trainer adds video
router.post("/add", authMiddleware, addTrainerVideoHandler);

// Client fetch videos
router.get("/client", authMiddleware, getClientVideosHandler);

export default router;