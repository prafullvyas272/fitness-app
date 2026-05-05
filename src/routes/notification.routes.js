import express from "express";
import { createTestNotificationHandler, getNotificationsHandler, markNotificationReadHandler, markAllNotificationsReadHandler } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/notifications/test", authMiddleware, createTestNotificationHandler);
router.get("/notifications", authMiddleware, getNotificationsHandler);
router.patch("/notifications/read-all", authMiddleware, markAllNotificationsReadHandler);
router.patch("/notifications/:id/read", authMiddleware, markNotificationReadHandler);

export default router;
