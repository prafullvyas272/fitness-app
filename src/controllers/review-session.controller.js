import { createSessionReview, getSessionReviewsByTrainer, getSessionReviewByBooking, updateSessionReview, deleteSessionReview } from "../services/review-session.service.js";

export const createSessionReviewHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { bookingId, trainerId, rating, comment } = req.body;

    if (!bookingId || !trainerId) {
      return res.status(400).json({
        success: false,
        message: "bookingId, trainerId, and rating are required"
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const review = await createSessionReview(customerId, bookingId, { rating, comment, trainerId });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getSessionReviewsByTrainerHandler = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: "trainerId is required"
      });
    }

    const result = await getSessionReviewsByTrainer(trainerId, Number(page), Number(pageSize));

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getSessionReviewByBookingHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    const review = await getSessionReviewByBooking(bookingId);

    res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review
    });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const updateSessionReviewHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    const review = await updateSessionReview(bookingId, customerId, { rating, comment });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const deleteSessionReviewHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    const result = await deleteSessionReview(bookingId, customerId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
