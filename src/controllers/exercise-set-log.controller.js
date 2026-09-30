import {
  logExerciseSets,
  getCustomerPlanSetLogs,
  getTrainerPlanSetLogs,
} from "../services/exercise-set-log.service.js";

export const logExerciseSetsHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { exerciseId } = req.params;

    if (!exerciseId) {
      return res.status(400).json({
        success: false,
        message: "exerciseId is required",
      });
    }

    const log = await logExerciseSets(customerId, exerciseId, req.body || {});

    res.status(200).json({
      success: true,
      message: "Sets logged successfully",
      data: log,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: err.message });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCustomerPlanSetLogsHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { planId } = req.params;

    const plan = await getCustomerPlanSetLogs(planId, customerId);

    res.status(200).json({
      success: true,
      message: "Set logs fetched successfully",
      data: plan,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: err.message });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getTrainerPlanSetLogsHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { planId } = req.params;

    const plan = await getTrainerPlanSetLogs(planId, trainerId);

    res.status(200).json({
      success: true,
      message: "Set logs fetched successfully",
      data: plan,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: err.message });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};
