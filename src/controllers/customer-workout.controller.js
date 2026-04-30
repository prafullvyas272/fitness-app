import {
  createCustomerWorkoutPlan,
  getCustomerWorkoutPlans,
  getCustomerWorkoutPlanDetail,
} from "../services/customer-workout.service.js";

export const getCustomerWorkoutPlansHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const plans = await getCustomerWorkoutPlans(customerId);
    res.status(200).json({
      success: true,
      message: "Workout plans fetched successfully.",
      data: plans,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCustomerWorkoutPlanDetailHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { planId } = req.params;
    const plan = await getCustomerWorkoutPlanDetail(planId, customerId);
    res.status(200).json({
      success: true,
      message: "Workout plan detail fetched successfully.",
      data: plan,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createCustomerWorkoutPlanHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { planName, numberOfDays, days } = req.body;

    const plan = await createCustomerWorkoutPlan({ customerId, planName, numberOfDays, days });

    res.status(201).json({
      success: true,
      message: "Workout plan created successfully.",
      data: plan,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
