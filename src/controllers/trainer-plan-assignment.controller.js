import {
  assignPlanToTrainer,
  getTrainerPlans,
  removePlanFromTrainer,
  updatePlanAssignment,
  assignMultiplePlansToTrainer,
  removeAllPlansFromTrainer,
} from "../services/trainer-plan-assignment.service.js";

export const assignPlanToTrainerHandler = async (req, res) => {
  try {
    const { trainerId, planId } = req.body;

    if (!trainerId || !planId) {
      return res.status(400).json({
        success: false,
        message: "trainerId and planId are required",
      });
    }

    const assignment = await assignPlanToTrainer(trainerId, planId);

    res.status(201).json({
      success: true,
      message: "Plan assigned to trainer successfully",
      data: assignment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTrainerPlansHandler = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { onlyActive } = req.query;

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: "trainerId is required",
      });
    }

    const plans = await getTrainerPlans(trainerId, onlyActive !== "false");

    res.status(200).json({
      success: true,
      message: "Trainer plans fetched successfully",
      data: plans,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const removePlanFromTrainerHandler = async (req, res) => {
  try {
    const { trainerId, planId } = req.params;

    if (!trainerId || !planId) {
      return res.status(400).json({
        success: false,
        message: "trainerId and planId are required",
      });
    }

    const result = await removePlanFromTrainer(trainerId, planId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updatePlanAssignmentHandler = async (req, res) => {
  try {
    const { trainerId, planId } = req.params;
    const { isActive } = req.body;

    if (!trainerId || !planId) {
      return res.status(400).json({
        success: false,
        message: "trainerId and planId are required",
      });
    }

    const assignment = await updatePlanAssignment(trainerId, planId, { isActive });

    res.status(200).json({
      success: true,
      message: "Plan assignment updated successfully",
      data: assignment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const assignMultiplePlansToTrainerHandler = async (req, res) => {
  try {
    const { trainerId, planIds } = req.body;

    if (!trainerId || !planIds || !Array.isArray(planIds) || planIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "trainerId and planIds (non-empty array) are required",
      });
    }

    const assignments = await assignMultiplePlansToTrainer(trainerId, planIds);

    res.status(201).json({
      success: true,
      message: `${assignments.length} plans assigned to trainer successfully`,
      data: assignments,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const removeAllPlansFromTrainerHandler = async (req, res) => {
  try {
    const { trainerId } = req.params;

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: "trainerId is required",
      });
    }

    const result = await removeAllPlansFromTrainer(trainerId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
