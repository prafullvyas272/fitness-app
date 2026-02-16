import { getTrainerSlotsByDate } from "../services/time-slot.service.js";
import { 
  createTimeSlot, 
  updateTimeSlot, 
  deleteTimeSlot, 
  showTimeSlot, 
  getAllTimeSlot 
} from "../services/time-slot.service.js";

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


// Controller: Create TimeSlot(s)
export const createTimeSlotHandler = async (req, res) => {
  try {
    const { date, peakSlots } = req.body;
    // Extract the user ID from the authentication middleware. Fallback order: req.user.id, req.user.userId
    const createdBy = req.user.userId;

    const createdSlots = await createTimeSlot({ date, peakSlots, createdBy });

    res.status(201).json({
      success: true,
      message: "Time slots created successfully.",
      data: createdSlots,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Controller: Update TimeSlot by ID
export const updateTimeSlotHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedSlot = await updateTimeSlot(id, updateData);

    res.status(200).json({
      success: true,
      message: "Time slot updated successfully.",
      data: updatedSlot,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Controller: Delete TimeSlot by ID
export const deleteTimeSlotHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSlot = await deleteTimeSlot(id);

    res.status(200).json({
      success: true,
      message: "Time slot deleted successfully.",
      data: deletedSlot,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Controller: Show TimeSlot by ID
export const showTimeSlotHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await showTimeSlot(id);

    res.status(200).json({
      success: true,
      message: "Time slot fetched successfully.",
      data: slot,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// Controller: Get All TimeSlots (with pagination/filtering)
export const getAllTimeSlotHandler = async (req, res) => {
  try {
    const {
      date,
      createdBy,
      page = 1,
      pageSize = 20
    } = req.query;

    const result = await getAllTimeSlot({
      date,
      createdBy,
      page: Number(page),
      pageSize: Number(pageSize)
    });

    res.status(200).json({
      success: true,
      message: "Time slots fetched successfully.",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
