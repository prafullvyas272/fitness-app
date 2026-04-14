import {
  createOrUpdateStepGoal,
  getStepGoal,
  addSteps,
  getTodaySteps
} from "../services/step.service.js";

import { createReminderNotification } from "../services/notification.service.js";

export const saveStepGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder, notify } = req.body;  // ✅ added notify

    // ✅ Validate required fields
    if (!goal || goal <= 0) {
      return res.status(400).json({ error: "Goal must be greater than 0" });
    }

    const data = await createOrUpdateStepGoal(userId, {
      goal,
      reminder,
      notify,  // ✅ passed to service
    });

    // ✅ Only send notification if notify is explicitly true
    if (notify === true && reminder) {
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

export const addUserSteps = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { steps } = req.body;

    if (!steps || steps <= 0) {
      return res.status(400).json({ error: "Steps must be greater than 0" });
    }

    await addSteps(userId, steps);

    const totalSteps = await getTodaySteps(userId);
    const goalData = await getStepGoal(userId);

    let goalReached = false;

    if (goalData && totalSteps >= goalData.goal) {
      goalReached = true;

      // ✅ Respect notify flag when goal is reached too
      if (goalData.notify !== false) {
        await createReminderNotification({
          userId,
          title: "Congratulations goal achieved!",
          message: `You've reached your step goal for today!`,
        });
      }
    }

    res.json({
      success: true,
      totalSteps,
      goal: goalData?.goal || 0,
      goalReached,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStepsProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalSteps = await getTodaySteps(userId);
    const goalData = await getStepGoal(userId);

    const goal = goalData?.goal || 0;
    const remaining = goal - totalSteps > 0 ? goal - totalSteps : 0;
    const percentage = goal > 0 ? Math.min((totalSteps / goal) * 100, 100) : 0;

    res.json({
      success: true,
      goal,
      steps: totalSteps,
      remaining,
      percentage: Math.round(percentage),
      goalReached: totalSteps >= goal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};