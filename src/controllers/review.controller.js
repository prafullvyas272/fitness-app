import {
  createReview,
  updateReview,
  getAllReviews,
  deleteReview
} from "../services/review.service.js";

/**
 * Create a new review
 */
export const createReviewHandler = async (req, res) => {
  try {
    // Extract review fields from body
    const { trainerId, customerId, rating, review, type } = req.body;

    // Compose data object for service
    const data = {
      trainerId,
      customerId,
      rating,
      review,
      type
    };

    const createdReview = await createReview(data);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: createdReview
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Update an existing review
 */
export const updateReviewHandler = async (req, res) => {
  try {
    // Try to extract by ID param (preferred), or trainerId, customerId, type from body or param
    const { id } = req.params;
    const { trainerId, customerId, type } = req.body;
    const updateData = req.body;

    const where = {};
    if (id) where.id = id;
    else if (trainerId && customerId && type) {
      where.trainerId = trainerId;
      where.customerId = customerId;
      where.type = type;
    } else {
      throw new Error("Missing identifiers to update review (id OR trainerId, customerId, type required)");
    }

    // Remove identifiers from update data to avoid overwriting them
    delete updateData.id;
    delete updateData.trainerId;
    delete updateData.customerId;
    delete updateData.type;

    const updatedReview = await updateReview(where, updateData);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Get all reviews (with optional filters & pagination)
 */
export const getAllReviewsHandler = async (req, res) => {
  try {
    const { trainerId, customerId, type, skip, take } = req.query;

    const filter = {};

    if (trainerId) filter.trainerId = trainerId;
    if (customerId) filter.customerId = customerId;
    if (type) filter.type = type;
    if (skip !== undefined) filter.skip = Number(skip);
    if (take !== undefined) filter.take = Number(take);

    const reviews = await getAllReviews(filter);

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Delete a review
 */
export const deleteReviewHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { trainerId, customerId, type } = req.body;

    const where = {};
    if (id) where.id = id;
    else if (trainerId && customerId && type) {
      where.trainerId = trainerId;
      where.customerId = customerId;
      where.type = type;
    } else {
      throw new Error("Missing identifiers to delete review (id OR trainerId, customerId, type required)");
    }

    const deletedReview = await deleteReview(where);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: deletedReview
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};