import {
  createOrUpdateWeightGoal,
  getWeightGoal,
  checkWeightGoal,
} from "../services/weight.service.js";

import { createReminderNotification } from "../services/notification.service.js";

export const saveWeightGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder } = req.body;

    const data = await createOrUpdateWeightGoal(userId, {
      goal,
      reminder,
    });

    // 🔔 notification
    if (reminder) {
      await createReminderNotification({
        userId,
        title: "Weight Reminder",
        message: `Track your weight goal (${goal} kg)`,
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeight = async (req, res) => {
  try {
    const userId = req.user.userId;

    const data = await getWeightGoal(userId);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWeight = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentWeight } = req.body;

    const goalReached = await checkWeightGoal(userId, currentWeight);

    if (goalReached) {
      await createReminderNotification({
        userId,
        title: "Congratulations goal achieved!",
        message: `You've reached your weight goal`,
    });
  }

  res.json({ success: true, goalReached });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};