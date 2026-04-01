import {
  createOrUpdateWeightGoal,
  getWeightGoal,
  checkWeightGoal,
  addWeightEntry,
  getCurrentWeight,
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
    const { weight } = req.body;

    if (!weight || weight <= 0) {
      return res.status(400).json({ error: "Weight must be valid" });
    }

    // ✅ Save entry
    await addWeightEntry(userId, weight);

    const goalData = await getWeightGoal(userId);

    let goalReached = false;

    if (goalData && weight <= goalData.goal) {
      goalReached = true;

      await createReminderNotification({
        userId,
        title: "Weight Goal Achieved 🎉",
        message: `Congratulations! You reached your goal weight (${goalData.goal} kg)!`,
      });
    }

    res.json({
      success: true,
      currentWeight: weight,
      goal: goalData?.goal || null,
      goalReached,
      message: goalReached
        ? "Congratulations! You reached your weight goal 🎉"
        : "Progress updated successfully",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentWeightData = async (req, res) => {
  try {
    const userId = req.user.userId;

    const currentWeight = await getCurrentWeight(userId);
    const goalData = await getWeightGoal(userId);

    res.json({
      success: true,
      currentWeight,
      goal: goalData?.goal || null,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};