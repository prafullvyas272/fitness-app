import { createTrainerPayout, getTrainerPayoutHistory } from "../services/trainer-payout.service.js";

export const createTrainerPayoutHandler = async (req, res) => {
  try {
    const { id: trainerId } = req.params;
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Request body must be JSON" });
    }
    const payout = await createTrainerPayout(trainerId, req.body);
    res.status(201).json({ success: true, data: payout });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const getTrainerPayoutsByAdminHandler = async (req, res) => {
  try {
    const { id: trainerId } = req.params;
    const { period, startDate, endDate, page, pageSize } = req.query;

    if (startDate && !endDate) {
      return res.status(400).json({ error: "endDate is required when startDate is provided" });
    }
    if (endDate && !startDate) {
      return res.status(400).json({ error: "startDate is required when endDate is provided" });
    }

    const result = await getTrainerPayoutHistory(trainerId, { period, startDate, endDate, page, pageSize });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrainerPayoutHistoryHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const { period, startDate, endDate, page, pageSize } = req.query;

    if (startDate && !endDate) {
      return res.status(400).json({ error: "endDate is required when startDate is provided" });
    }
    if (endDate && !startDate) {
      return res.status(400).json({ error: "startDate is required when endDate is provided" });
    }

    const result = await getTrainerPayoutHistory(trainerId, { period, startDate, endDate, page, pageSize });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
