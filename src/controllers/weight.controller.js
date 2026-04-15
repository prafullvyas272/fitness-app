import {
  createOrUpdateWeightGoal,
  getWeightGoal,
  checkWeightGoal,
  addWeightEntry,
  getCurrentWeight,
  patchWeightGoal,                 // ✅
  getLast7DaysWeightProgress,      // ✅
} from "../services/weight.service.js";

import { createReminderNotification } from "../services/notification.service.js";

export const saveWeightGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder, notify } = req.body;  // ✅ added notify

    if (goal === undefined && reminder === undefined && notify === undefined) {
      return res.status(400).json({ error: "At least one field required: goal, reminder, or notify" });
    }

    const updates = {};

    if (goal !== undefined) {
      if (goal <= 0) {
        return res.status(400).json({ error: "Goal must be greater than 0" });
      }
      updates.goal = goal;
    }

    if (reminder !== undefined) updates.reminder = reminder;

    if (notify !== undefined) {
      if (typeof notify !== "boolean") {
        return res.status(400).json({ error: "notify must be true or false" });
      }
      updates.notify = notify;
    }

    const data = await createOrUpdateWeightGoal(userId, updates);

    // ✅ Only notify if notify is true AND reminder exists
    if (updates.notify === true && updates.reminder) {
      await createReminderNotification({
        userId,
        title: "Weight Reminder",
        message: `Track your weight goal (${updates.goal || data.goal} kg)`,
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

// ✅ PATCH — partial update
export const updateWeightGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder, notify } = req.body;

    if (goal === undefined && reminder === undefined && notify === undefined) {
      return res.status(400).json({
        error: "At least one field required: goal, reminder, or notify",
      });
    }

    const updates = {};

    if (goal !== undefined) {
      if (goal <= 0) {
        return res.status(400).json({ error: "Goal must be greater than 0" });
      }
      updates.goal = goal;
    }

    if (reminder !== undefined) updates.reminder = reminder;

    if (notify !== undefined) {
      if (typeof notify !== "boolean") {
        return res.status(400).json({ error: "notify must be true or false" });
      }
      updates.notify = notify;
    }

    const data = await patchWeightGoal(userId, updates);

    // ✅ If notify just turned on and reminder exists — send notification
    if (notify === true && data.reminder) {
      await createReminderNotification({
        userId,
        title: "Weight Reminder Updated",
        message: `Your weight reminder is set for ${data.reminder}`,
      });
    }

    res.json({
      success: true,
      updated: Object.keys(updates),
      data,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
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

    await addWeightEntry(userId, weight);

    const goalData = await getWeightGoal(userId);
    let goalReached = false;

    if (goalData && weight <= goalData.goal) {
      goalReached = true;

      // ✅ Respect notify flag
      if (goalData.notify !== false) {
        await createReminderNotification({
          userId,
          title: "Weight Goal Achieved 🎉",
          message: `Congratulations! You reached your goal weight (${goalData.goal} kg)!`,
        });
      }
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

// ✅ Weekly progress chart
export const getWeeklyWeightProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { chartData, bestDay, average, totalEntriesDays } =
      await getLast7DaysWeightProgress(userId);

    res.json({
      success: true,
      period: "Last 7 days",
      chartData,
      bestDay,
      average,
      totalEntriesDays,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeightProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const latestWeight = await prisma.weightEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const goalData = await prisma.weightGoal.findUnique({
      where: { userId },
    });

    const current = latestWeight?.weight || 0;
    const goal = goalData?.goal || 0;

    let remaining = 0;
    let percentage = 0;
    let goalReached = false;

    if (goal > 0) {
      remaining = Math.max(current - goal, 0); // for weight loss

      percentage = Math.min((current / goal) * 100, 100);

      if (current <= goal) {
        goalReached = true;
        percentage = 100;
        remaining = 0;
      }
    }

    res.json({
      success: true,
      goal,
      current,
      remaining,
      percentage: Math.round(percentage),
      goalReached,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

