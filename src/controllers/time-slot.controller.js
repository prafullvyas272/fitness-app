import { getTrainerSlotsByDate } from "../services/time-slot.service.js";

export const getTrainerSlotsByDateHandler = async (req, res) => {
  try {
    const trainerId = req.params.trainerId || req.query.trainerId || req.body.trainerId;
    const date = req.query.date || req.body.date;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await getTrainerSlotsByDate(trainerId, date, page, pageSize);

    res.status(200).json({
      success: true,
      message: "Trainer time slots fetched successfully.",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
