import cron from "node-cron";
import prisma from "../src/utils/prisma.js";
import { createReminderNotification } from "../src/services/notification.service.js";

export const startReminderCron = () => {
  // runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

      const stepGoals = await prisma.stepGoal.findMany();

      for (const goal of stepGoals) {
        if (goal.reminder === currentTime) {
          await createReminderNotification({
            userId: goal.userId,
            title: "Steps Reminder",
            message: `Complete your ${goal.goal} steps today!`,
          });
        }
      }

    } catch (error) {
      console.error("Cron Error:", error);
    }
  });
};