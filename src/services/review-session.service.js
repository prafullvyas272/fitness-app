import prisma from "../utils/prisma.js";

export const createSessionReview = async (customerId, bookingId, data) => {
  try {
    const { rating, comment, trainerId } = data;

    if (!customerId || !bookingId || !trainerId) {
      throw new Error("customerId, bookingId, and trainerId are required");
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const booking = await prisma.trainerBooking.findUnique({
      where: { id: bookingId },
      select: { customerId: true, trainerId: true }
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.customerId !== customerId) {
      throw new Error("Unauthorized - this booking doesn't belong to you");
    }

    if (booking.trainerId !== trainerId) {
      throw new Error("Trainer ID mismatch");
    }

    const existingReview = await prisma.sessionReview.findFirst({
      where: { bookingId }
    });

    if (existingReview) {
      throw new Error("Review already exists for this booking");
    }

    const review = await prisma.sessionReview.create({
      data: {
        customerId,
        bookingId,
        trainerId,
        rating,
        comment: comment || null,
        createdAt: new Date()
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return review;
  } catch (err) {
    throw new Error(`Failed to create review: ${err.message}`);
  }
};

export const getSessionReviewsByTrainer = async (trainerId, page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    const [reviews, total] = await Promise.all([
      prisma.sessionReview.findMany({
        where: { trainerId },
        skip,
        take: pageSize,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          booking: { select: { id: true, timeSlot: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.sessionReview.count({ where: { trainerId } })
    ]);

    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return {
      reviews,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      averageRating
    };
  } catch (err) {
    throw new Error(`Failed to fetch reviews: ${err.message}`);
  }
};

export const getSessionReviewByBooking = async (bookingId) => {
  try {
    const review = await prisma.sessionReview.findFirst({
      where: { bookingId },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  } catch (err) {
    throw new Error(`Failed to fetch review: ${err.message}`);
  }
};

export const updateSessionReview = async (bookingId, customerId, data) => {
  try {
    const { rating, comment } = data;

    const review = await prisma.sessionReview.findFirst({
      where: { bookingId }
    });

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.customerId !== customerId) {
      throw new Error("Unauthorized - you can only edit your own review");
    }

    const updateData = {};
    if (rating !== undefined && rating >= 1 && rating <= 5) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const updated = await prisma.sessionReview.update({
      where: { id: review.id },
      data: updateData,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return updated;
  } catch (err) {
    throw new Error(`Failed to update review: ${err.message}`);
  }
};

export const deleteSessionReview = async (bookingId, customerId) => {
  try {
    const review = await prisma.sessionReview.findFirst({
      where: { bookingId }
    });

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.customerId !== customerId) {
      throw new Error("Unauthorized - you can only delete your own review");
    }

    await prisma.sessionReview.delete({
      where: { id: review.id }
    });

    return { success: true, message: "Review deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete review: ${err.message}`);
  }
};
