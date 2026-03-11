import { getAllTrainerRequests } from "../services/trainer-request.service.js";

export const getAllTrainerRequestsHandler = async (req, res) => {
  try {
    const trainerRequests = await getAllTrainerRequests();
    res.status(200).json({
      success: true,
      message: "Trainer requests fetched successfully",
      data: trainerRequests
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};