import {
  createPlan,
  updatePlan,
  deletePlan,
  listAllPlans,
  getPlanById,
} from "../services/plan.service.js";

/**
 * Controller to create a new plan.
 */
export const createPlanHandler = async (req, res) => {
  try {
    const { name, price, features, isPopular } = req.body;
    const createdBy = req.user?.userId;

    if (!name || price === undefined || !features || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, features, or user",
      });
    }

    const plan = await createPlan({
      name,
      price,
      features,
      isPopular,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller to update an existing plan.
 */
export const updatePlanHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, features, isPopular } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing plan ID in request params",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (features !== undefined) updateData.features = features;
    if (isPopular !== undefined) updateData.isPopular = isPopular;

    const updatedPlan = await updatePlan(id, updateData);

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: updatedPlan,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller to delete a plan by ID.
 */
export const deletePlanHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing plan ID in request params",
      });
    }

    const deletedPlan = await deletePlan(id);

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
      data: deletedPlan,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller to list all plans.
 */
export const listAllPlansHandler = async (req, res) => {
  try {
    const plans = await listAllPlans();
    res.status(200).json({
      success: true,
      message: "Plans fetched successfully",
      data: plans,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller to get plan by ID.
 */
export const getPlanByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing plan ID in request params",
      });
    }

    const plan = await getPlanById(id);

    res.status(200).json({
      success: true,
      message: "Plan fetched successfully",
      data: plan,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};
