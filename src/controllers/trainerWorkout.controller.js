import {
  createTrainerWorkoutPlan,
  getTrainerWorkoutPlans,
  getTrainerWorkoutPlanDetail,
  getPremiumWorkoutPlansForCustomer,
  getPremiumWorkoutPlanDetailForCustomer,
} from "../services/trainerWorkout.service.js";

// Trainer: get all their plans
export const getTrainerWorkoutPlansHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const plans = await getTrainerWorkoutPlans(trainerId);
    res.status(200).json({ success: true, message: "Workout plans fetched successfully.", data: plans });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Trainer: get detail of one plan
export const getTrainerWorkoutPlanDetailHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { planId } = req.params;
    const plan = await getTrainerWorkoutPlanDetail(planId, trainerId);
    res.status(200).json({ success: true, message: "Workout plan detail fetched successfully.", data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Customer: get all premium plans from assigned trainer
export const getPremiumWorkoutPlansForCustomerHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const plans = await getPremiumWorkoutPlansForCustomer(customerId);
    res.status(200).json({ success: true, message: "Premium workout plans fetched successfully.", data: plans });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Customer: get detail of a specific premium plan
export const getPremiumWorkoutPlanDetailForCustomerHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { planId } = req.params;
    const plan = await getPremiumWorkoutPlanDetailForCustomer(planId, customerId);
    res.status(200).json({ success: true, message: "Premium workout plan detail fetched successfully.", data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createTrainerWorkoutPlanHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { customerId } = req.params;
    const { planName, numberOfDays, days } = req.body;

    const plan = await createTrainerWorkoutPlan({ trainerId, customerId, planName, numberOfDays, days });

    res.status(201).json({
      success: true,
      message: "Workout plan created successfully.",
      data: plan,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
