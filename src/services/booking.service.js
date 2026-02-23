import prisma from "../utils/prisma.js";

/**
 * Get a paginated list of bookings for a specific trainer.
 * 
 */
export const getBookingsByTrainerWithPagination = async ( trainerId, page = 1, pageSize = 10) => {
  if (!trainerId) {
    throw new Error("trainerId is required");
  }

  const skip = (page - 1) * pageSize;

  const [total, bookings] = await Promise.all([
    prisma.trainerBooking.count({
      where: { trainerId: trainerId }
    }),
    prisma.trainerBooking.findMany({
      where: { trainerId: trainerId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        timeSlot:{
          select: {
            id: true,
            startTime: true,
            endTime: true,
            slotType: true
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            userProfileDetails: {
              select: {
                id: true,
                hostGymName: true,
              }
            }
          }
        }
      }
    })
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    bookings,
    pagination: {
      total,
      page,
      pageSize,
      totalPages
    }
  };
};

/**
 * Book a slot for a customer.
 *
 */
export const bookSlot = async (customerId, trainerId, timeSlotId) => {
  if (!customerId || !trainerId || !timeSlotId) {
    throw new Error("customerId, trainerId, and timeSlotId are required");
  }

  // Check if the time slot exists and is not already booked
  const slot = await prisma.trainerTimeSlot.findUnique({
    where: { 
      id: timeSlotId,
    }
  });

  if (!slot) {
    throw new Error("Time slot not found");
  }
  if (slot.isBooked) {
    throw new Error("Time slot is already booked");
  }
  if (slot.trainerId !== trainerId) {
    throw new Error("TrainerId does not match the time slot");
  }

  // Book the slot: create booking and update slot to isBooked: true
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.trainerBooking.create({
        data: {
          customerId,
          trainerId,
          timeSlotId,
          originalTimeSlotId: timeSlotId,
        }
      });

      await tx.trainerTimeSlot.update({
        where: { id: timeSlotId },
        data: { isBooked: true }
      });

      return newBooking;
    });

    return booking;
  } catch (err) {
    throw new Error("Failed to book slot: " + err.message);
  }
};


export const markAsAttended = async (bookingId, isAttended) => {
  if (!bookingId || typeof isAttended !== "boolean") {
    throw new Error("bookingId and isAttended are required");
  }

  // Find the booking by bookingId
  const booking = await prisma.trainerBooking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  try {
    const updatedBooking = await prisma.trainerBooking.update({
      where: { id: bookingId },
      data: { isAttendedByTrainer: isAttended },
    });
    return updatedBooking;
  } catch (err) {
    throw new Error("Failed to mark as attended: " + err.message);
  }
};


/**
 * Cancel a booking by its ID.
 * @param {string} bookingId - The booking ID to cancel.
 * @returns {Promise<object>} - The cancelled booking object.
 */
export const cancelBookingById = async (bookingId) => {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }

  const booking = await prisma.trainerBooking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isCancelled) {
    throw new Error("Booking is already cancelled");
  }

  try {
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Mark booking as cancelled
      const cancelledBooking = await tx.trainerBooking.update({
        where: { id: bookingId },
        data: { isCancelled: true }
      });

      // Mark timeslot as available
      await tx.trainerTimeSlot.update({
        where: { id: booking.timeSlotId },
        data: { isBooked: false }
      });

      return cancelledBooking;
    });

    return updatedBooking;
  } catch (err) {
    throw new Error("Failed to cancel booking: " + err.message);
  }
};


/**
 * Reschedule a booking by changing its timeslot.
 * @param {string} bookingId - The booking ID to reschedule.
 * @param {string} newTimeSlotId - The new timeslot ID to assign.
 * @returns {Promise<object>} - The updated booking object.
 */
export const rescheduleBooking = async (bookingId, newTimeSlotId) => {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }
  if (!newTimeSlotId) {
    throw new Error("newTimeSlotId is required");
  }

  // Find existing booking
  const booking = await prisma.trainerBooking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isCancelled) {
    throw new Error("Cannot reschedule a cancelled booking");
  }

  // Check if new timeslot exists & not booked
  const newTimeSlot = await prisma.trainerTimeSlot.findUnique({
    where: { id: newTimeSlotId }
  });

  if (!newTimeSlot) {
    throw new Error("New time slot not found");
  }

  if (newTimeSlot.isBooked) {
    throw new Error("New time slot is already booked");
  }

  // Prevent rescheduling to same slot
  if (booking.timeSlotId === newTimeSlotId) {
    throw new Error("Booking is already assigned to the given time slot");
  }

  try {
    // Transaction to move booking to new slot and update slot statuses
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Free up old time slot
      await tx.trainerTimeSlot.update({
        where: { id: booking.timeSlotId },
        data: { isBooked: false }
      });

      // Mark new time slot as booked
      await tx.trainerTimeSlot.update({
        where: { id: newTimeSlotId },
        data: { isBooked: true }
      });

      // Update booking
      const updated = await tx.trainerBooking.update({
        where: { id: bookingId },
        data: {
          timeSlotId: newTimeSlotId,
          rescheduledCount: booking.rescheduledCount + 1,
          lastRescheduledAt: new Date(),
          originalTimeSlotId: booking.originalTimeSlotId
            ? booking.originalTimeSlotId
            : booking.timeSlotId
        }
      });

      return updated;
    });

    return updatedBooking;
  } catch (err) {
    throw new Error("Failed to reschedule booking: " + err.message);
  }
};


/**
 * Get a booking's details (including customer, trainer, and timeSlot) by bookingId.
 * @param {string} bookingId
 * @returns {Promise<Object>} Booking details object
 */
export const getBookingDetailsById = async (bookingId) => {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }

  const booking = await prisma.trainerBooking.findUnique({
    where: { id: bookingId },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      timeSlot: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          slotType: true,
          durationMinutes: true
        }
      }
    }
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};


/**
 * Update accolades array for a booking.
 * @param {string} bookingId
 * @param {number[]} accolades
 * @returns {Promise<Object>} The updated booking object
 */
export const updateBookingAccolades = async (bookingId, accolades) => {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }
  if (!Array.isArray(accolades)) {
    throw new Error("accolades must be an array");
  }

  const updatedBooking = await prisma.trainerBooking.update({
    where: { id: bookingId },
    data: { accolades },
  });

  return updatedBooking;
};
