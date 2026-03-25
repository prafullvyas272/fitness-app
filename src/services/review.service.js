import prisma from "../utils/prisma.js";

/**
 * Create a new review
 * @param {Object} data - Review data
 * @param {String} [data.trainerId] - Trainer ID (optional)
 * @param {String} [data.customerId] - Customer ID (optional)
 * @param {number} data.rating - Rating value
 * @param {string} [data.review] - Review text (optional)
 * @param {'BUSINESS'|'TRAINER'} data.type - ReviewType enum
 * @returns {Promise<Object>} Created Review
 */
export const createReview = async (data) => {
  try {
    // This will throw on duplicate (trainerId, customerId, type)
    const review = await prisma.review.create({
      data
    });
    return review;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error("A review already exists for this trainer, customer and type");
    }
    throw new Error(`Failed to create review: ${error.message}`);
  }
};

/**
 * Update an existing review
 * @param {Object} where - Unique identifiers
 * @param {String} [where.id] - Review ID (preferred)
 * OR
 * @param {String} [where.trainerId] - Trainer ID
 * @param {String} [where.customerId] - Customer ID
 * @param {'BUSINESS'|'TRAINER'} [where.type] - ReviewType
 * @param {Object} data - Fields to update (rating, review, etc.)
 * @returns {Promise<Object>} Updated Review
 */
export const updateReview = async (where, data) => {
  try {
    let uniqueWhere;
    if (where.id) {
      uniqueWhere = { id: where.id };
    } else if (where.trainerId && where.customerId && where.type) {
      uniqueWhere = {
        trainerId_customerId_type: {
          trainerId: where.trainerId,
          customerId: where.customerId,
          type: where.type
        }
      };
    } else {
      throw new Error("Insufficient identifiers to update review");
    }

    const review = await prisma.review.update({
      where: uniqueWhere,
      data
    });
    return review;
  } catch (error) {
    throw new Error(`Failed to update review: ${error.message}`);
  }
};

/**
 * Get all reviews with optional filters
 * @param {Object} filter - Filter options
 * @param {String} [filter.trainerId] - Filter by Trainer ID
 * @param {String} [filter.customerId] - Filter by Customer ID
 * @param {'BUSINESS'|'TRAINER'} [filter.type] - Filter by type
 * @param {Number} [filter.skip] - Pagination: skip
 * @param {Number} [filter.take] - Pagination: take/limit
 * @returns {Promise<Array>} Array of reviews
 */
export const getAllReviews = async (filter = {}) => {
  try {
    const { trainerId, customerId, type } = filter;

    const where = {};
    if (trainerId) where.trainerId = trainerId;
    if (customerId) where.customerId = customerId;
    if (type) where.type = type;

    // Return only the single most recent review given the filters.
    const review = await prisma.review.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        trainer: true,
        customer: true
      }
    });

    // Always return a single-element array or empty array for consistency
    return review ? [review] : [];
  } catch (error) {
    throw new Error(`Failed to get reviews: ${error.message}`);
  }
};

/**
 * Delete a review by unique identifier
 * @param {Object} where - Unique identifiers
 * @param {String} [where.id] - Review ID (preferred)
 * OR
 * @param {String} [where.trainerId] - Trainer ID
 * @param {String} [where.customerId] - Customer ID
 * @param {'BUSINESS'|'TRAINER'} [where.type] - ReviewType
 * @returns {Promise<Object>} Deleted Review
 */
export const deleteReview = async (where) => {
  try {
    let uniqueWhere;
    if (where.id) {
      uniqueWhere = { id: where.id };
    } else if (where.trainerId && where.customerId && where.type) {
      uniqueWhere = {
        trainerId_customerId_type: {
          trainerId: where.trainerId,
          customerId: where.customerId,
          type: where.type
        }
      };
    } else {
      throw new Error("Insufficient identifiers to delete review");
    }

    const review = await prisma.review.delete({
      where: uniqueWhere
    });
    return review;
  } catch (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
};