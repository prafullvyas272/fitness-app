import {
  createGymRent,
  updateGymRent,
  getGymRent,
  getAllGymRents,
  deleteGymRent,
} from "../services/gym-rent.service.js";

export const createGymRentHandler = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { trainerId, rentAmount, rentFrequency, currency, description, notes } = req.body;

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: "trainerId is required",
      });
    }

    if (rentAmount === undefined || rentAmount === null) {
      return res.status(400).json({
        success: false,
        message: "rentAmount is required",
      });
    }

    const gymRent = await createGymRent(
      trainerId,
      { rentAmount, rentFrequency, currency, description, notes },
      adminId
    );

    res.status(201).json({
      success: true,
      message: "Gym rent created successfully",
      data: gymRent,
    });
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateGymRentHandler = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { trainerId } = req.params;
    const { rentAmount, rentFrequency, currency, description, notes } = req.body;

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: "trainerId is required",
      });
    }

    const gymRent = await updateGymRent(
      trainerId,
      { rentAmount, rentFrequency, currency, description, notes },
      adminId
    );

    res.status(200).json({
      success: true,
      message: "Gym rent updated successfully",
      data: gymRent,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getGymRentHandler = async (req, res) => {
  try {
    const { trainerId } = req.params;

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: "trainerId is required",
      });
    }

    const gymRent = await getGymRent(trainerId);

    res.status(200).json({
      success: true,
      message: "Gym rent fetched successfully",
      data: gymRent,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllGymRentsHandler = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await getAllGymRents(page, pageSize);

    res.status(200).json({
      success: true,
      message: "Gym rents fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteGymRentHandler = async (req, res) => {
  try {
    const { trainerId } = req.params;

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: "trainerId is required",
      });
    }

    const result = await deleteGymRent(trainerId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
