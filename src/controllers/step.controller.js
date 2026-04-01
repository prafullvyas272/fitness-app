import {
  createOrUpdateStepGoal,
  getStepGoal,
} from "../services/step.service.js";

import { createReminderNotification } from "../services/notification.service.js";

export const saveStepGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder } = req.body;

    const data = await createOrUpdateStepGoal(userId, {
      goal,
      reminder,
    });

    // 🔔 create notification
    if (reminder) {
      await createReminderNotification({
        userId,
        title: "Steps Reminder",
        message: `Complete your ${goal} steps today!`,
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSteps = async (req, res) => {
  try {
    const userId = req.user.userId;

    const data = await getStepGoal(userId);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};