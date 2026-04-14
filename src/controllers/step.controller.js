import {
  createOrUpdateStepGoal,
  getStepGoal,
  addSteps,
  getTodaySteps,
  getLast7DaysProgress,      //  import new function
  patchStepGoal,
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

// ... your existing controllers stay same ...

export const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { chartData, bestDay, average } = await getLast7DaysProgress(userId);

    res.json({
      success: true,
      period: "Last 7 days",
      chartData,       // array of { day, date, steps }
      bestDay,         // { steps, day, date }
      average,         // number
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStepGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal, reminder, notify } = req.body;

    // ✅ At least one field must be provided
    if (goal === undefined && reminder === undefined && notify === undefined) {
      return res.status(400).json({
        error: "At least one field required: goal, reminder, or notify",
      });
    }

    // ✅ Build only the fields that were actually sent
    const updates = {};

    if (goal !== undefined) {
      if (goal <= 0) {
        return res.status(400).json({ error: "Goal must be greater than 0" });
      }
      updates.goal = goal;
    }

    if (reminder !== undefined) {
      updates.reminder = reminder;
    }

    if (notify !== undefined) {
      if (typeof notify !== "boolean") {
        return res.status(400).json({ error: "notify must be true or false" });
      }
      updates.notify = notify;
    }

    const data = await patchStepGoal(userId, updates);

    // ✅ If notify just turned ON and reminder exists — send notification
    if (notify === true && data.reminder) {
      await createReminderNotification({
        userId,
        title: "Steps Reminder Updated",
        message: `Your step goal reminder is set for ${data.reminder}`,
      });
    }

    res.json({
      success: true,
      updated: Object.keys(updates),   // tells frontend what changed
      data,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};