import {
  createPremiumStepGoal,
  getCustomerPremiumStepGoal,
  startPremiumStepGoal,
  finishActiveStepGoal,
} from "../services/premium-steps.service.js";

export const createPremiumStepGoalHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { customerId } = req.params;
    const { goal, reminder, notify } = req.body;
    const data = await createPremiumStepGoal({ trainerId, customerId, goal, reminder, notify });
    res.status(201).json({ success: true, message: "Premium step goal created.", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCustomerPremiumStepGoalHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const data = await getCustomerPremiumStepGoal(customerId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const startPremiumStepGoalHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const data = await startPremiumStepGoal(customerId);
    res.status(200).json({ success: true, message: "Premium step goal started.", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const finishActiveStepGoalHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await finishActiveStepGoal(userId);
    res.status(200).json({ success: true, message: "Step goal finished.", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
