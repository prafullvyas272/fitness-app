import {
  createPremiumWeightGoal,
  getCustomerPremiumWeightGoal,
  startPremiumWeightGoal,
  finishActiveWeightGoal,
} from "../services/premium-weight.service.js";

export const createPremiumWeightGoalHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { customerId } = req.params;
    const { goal, weightGoalType, reminder, notify } = req.body;
    const data = await createPremiumWeightGoal({ trainerId, customerId, goal, weightGoalType, reminder, notify });
    res.status(201).json({ success: true, message: "Premium weight goal created.", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCustomerPremiumWeightGoalHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const data = await getCustomerPremiumWeightGoal(customerId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const startPremiumWeightGoalHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const data = await startPremiumWeightGoal(customerId);
    res.status(200).json({ success: true, message: "Premium weight goal started.", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const finishActiveWeightGoalHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await finishActiveWeightGoal(userId);
    res.status(200).json({ success: true, message: "Weight goal finished.", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
