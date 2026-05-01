import {
  createOrUpdateWeightGoal,
  getWeightGoal,
  checkWeightGoal,
  addWeightEntry,
  getCurrentWeight,
  patchWeightGoal,                 // ✅
  getLast7DaysWeightProgress,      // ✅
} from "../services/weight.service.js";

import prisma from "../utils/prisma.js";
import { getActiveWeightGoal } from "../services/premium-weight.service.js";
import { createReminderNotification } from "../services/notification.service.js";

export const saveWeightGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder, notify, weightGoalType, currentWeight } = req.body;

    if (goal === undefined && reminder === undefined && notify === undefined && weightGoalType === undefined) {
      return res.status(400).json({ error: "At least one field required: goal, weightGoalType, reminder, or notify" });
    }

    const updates = {};

    if (goal !== undefined) {
      if (goal <= 0) return res.status(400).json({ error: "Goal must be greater than 0" });
      updates.goal = goal;
    }

    if (weightGoalType !== undefined) {
      if (!["LOSE", "GAIN"].includes(weightGoalType)) {
        return res.status(400).json({ error: "weightGoalType must be LOSE or GAIN" });
      }
      updates.weightGoalType = weightGoalType;
    }

    if (reminder !== undefined) updates.reminder = reminder;

    if (notify !== undefined) {
      if (typeof notify !== "boolean") {
        return res.status(400).json({ error: "notify must be true or false" });
      }
      updates.notify = notify;
    }

    const data = await createOrUpdateWeightGoal(userId, updates);

    if (currentWeight !== undefined) {
      if (currentWeight <= 0) return res.status(400).json({ error: "currentWeight must be greater than 0" });
      await addWeightEntry(userId, currentWeight);
    }

    if (updates.notify === true && updates.reminder) {
      await createReminderNotification({
        userId,
        title: "Weight Reminder",
        message: `Track your weight goal (${updates.goal || data.goal} kg)`,
      });
    }

    res.json({ success: true, data, currentWeight: currentWeight ?? null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeight = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await getWeightGoal(userId);
    const currentWeight = await getCurrentWeight(userId);
    const goal = data?.goal ?? null;
    const remaining = goal !== null && currentWeight !== null ? Math.abs(goal - currentWeight) : null;
    res.json({ success: true, data, currentWeight, remaining });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ PATCH — partial update
export const updateWeightGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder, notify, weightGoalType } = req.body;

    if (goal === undefined && reminder === undefined && notify === undefined && weightGoalType === undefined) {
      return res.status(400).json({
        error: "At least one field required: goal, weightGoalType, reminder, or notify",
      });
    }

    const updates = {};

    if (goal !== undefined) {
      if (goal <= 0) return res.status(400).json({ error: "Goal must be greater than 0" });
      updates.goal = goal;
    }

    if (weightGoalType !== undefined) {
      if (!["LOSE", "GAIN"].includes(weightGoalType)) {
        return res.status(400).json({ error: "weightGoalType must be LOSE or GAIN" });
      }
      updates.weightGoalType = weightGoalType;
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

    const active = await getActiveWeightGoal(userId);
    const goalData = active?.goal || null;
    let goalReached = false;

    if (goalData?.goal) {
      const isLose = (goalData.weightGoalType ?? "LOSE") === "LOSE";
      goalReached = isLose ? weight <= goalData.goal : weight >= goalData.goal;

      if (goalReached && goalData.notify !== false) {
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
      goalType: active?.type || null,
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
    const active = await getActiveWeightGoal(userId);
    const goalData = active?.goal || null;

    const goal = goalData?.goal || null;
    const remaining = goal !== null && currentWeight !== null ? Math.abs(goal - currentWeight) : null;

    res.json({
      success: true,
      currentWeight,
      goal,
      weightGoalType: goalData?.weightGoalType ?? null,
      goalType: active?.type || null,
      remaining,
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

    const active = await getActiveWeightGoal(userId);
    const goalData = active?.goal || null;

    const current = latestWeight?.weight ?? null;
    const goal = goalData?.goal ?? null;
    const isLose = (goalData?.weightGoalType ?? "LOSE") === "LOSE";

    const firstEntryAfterGoal = goalData
      ? await prisma.weightEntry.findFirst({
          where: { userId, createdAt: { gte: goalData.updatedAt } },
          orderBy: { createdAt: "asc" },
        })
      : null;
    const starting = firstEntryAfterGoal?.weight ?? null;

    let remaining = 0;
    let percentage = 0;
    let goalReached = false;

    if (goal !== null && goal > 0 && current !== null) {
      goalReached = isLose ? current <= goal : current >= goal;
      remaining = goalReached ? 0 : Math.abs(goal - current);

      if (goalReached) {
        percentage = 100;
      } else if (starting !== null && Math.abs(starting - goal) > 0) {
        const progress = Math.abs(starting - current);
        const total = Math.abs(starting - goal);
        percentage = Math.min(Math.round((progress / total) * 100), 99);
      }
    }

    res.json({
      success: true,
      goal,
      goalType: active?.type || null,
      current,
      remaining,
      percentage: Math.round(percentage),
      goalReached,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};