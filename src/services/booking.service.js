import prisma from "../utils/prisma.js";

/**
 * Get a paginated list of bookings for a specific trainer.
 * 
 */
export const getBookingsByTrainerWithPagination = async ( trainerId, date = null, page = 1, pageSize = 10) => {
  if (!trainerId) {
    throw new Error("trainerId is required");
  }

  const skip = (page - 1) * pageSize;

  // If date is provided, filter bookings where the related timeSlot's date matches
  const dateFilter = date ? {
        timeSlot: {
          date: {
            equals: new Date(date),
          },
        },
      }
    : {};

  const filters = {
    trainerId: trainerId,
    ...dateFilter,
  };

  const [total, bookings] = await Promise.all([
    prisma.trainerBooking.count({
      where: filters
    }),
    prisma.trainerBooking.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        timeSlot: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            slotType: true,
            date: true,
          }
        },
        customer: {
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

  const normalizedTimeSlotId = String(timeSlotId).trim();

  // Primary lookup: trainer slot id.
  // Fallback lookup: admin timeslot id mapped in trainerTimeSlot.timeSlotId.
  const slot =
    await prisma.trainerTimeSlot.findFirst({
      where: {
        trainerId,
        id: normalizedTimeSlotId,
      },
    }) ||
    await prisma.trainerTimeSlot.findFirst({
      where: {
        trainerId,
        timeSlotId: normalizedTimeSlotId,
      },
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
          timeSlotId: slot.id,
          originalTimeSlotId: slot.id,
        }
      });

      await tx.trainerTimeSlot.update({
        where: { id: slot.id },
        data: { isBooked: true }
      });

      return newBooking;
    });

    return booking;
  } catch (err) {
    throw new Error("Failed to book slot: " + err.message);
  }
};


export const markAsAttended = async (bookingId, bookingStatus) => {
  if (!bookingId) {
    throw new Error("bookingId is required");
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
      data: { 
        bookingStatus: bookingStatus
      },
    });
    return updatedBooking;
  } catch (err) {
    throw new Error("Failed to mark as attended: " + err.message);
  }
};


/**
 * Cancel a booking by its ID.
 * @param {string} bookingId - The booking ID to cancel.
 * @param {string} [remarks] - Optional cancellation remarks.
 * @returns {Promise<object>} - The cancelled booking object.
 */
export const cancelBookingById = async (bookingId, remarks) => {
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
    const normalizedRemarks =
      typeof remarks === "string" ? remarks.trim() : undefined;

    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Mark booking as cancelled
      const cancelledBooking = await tx.trainerBooking.update({
        where: { id: bookingId },
        data: {
          isCancelled: true,
          ...(normalizedRemarks !== undefined ? { remarks: normalizedRemarks } : {}),
        }
      });

      // Mark timeslot as available
      // Only update timeslot if found (defensive check)
      const timeSlot = await tx.trainerTimeSlot.findUnique({
        where: { id: booking.timeSlotId }
      });

      if (timeSlot) {
        await tx.trainerTimeSlot.update({
          where: { id: booking.timeSlotId },
          data: { isBooked: false }
        });
      }

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
          email: true,
          isPremiumMember: true,
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


export const getBookingAndAvailabilityData = async (trainerId) => {
  try {
    const now = new Date();
    const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));
    const rangeEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1));

    const slots = await prisma.trainerTimeSlot.findMany({
      where: {
        trainerId,
        date: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      select: {
        date: true,
        isBooked: true,
      },
    });

    const dateMap = new Map();

    for (const slot of slots) {
      const key = slot.date.toISOString().slice(0, 10);
      if (!dateMap.has(key)) {
        dateMap.set(key, { total: 0, booked: 0 });
      }
      const entry = dateMap.get(key);
      entry.total += 1;
      if (slot.isBooked) entry.booked += 1;
    }

    const booked = [];
    const available = [];
    const holiday = [];
    const holidaySet = new Set();

    const current = new Date(rangeStart);
    while (current < rangeEnd) {
      if (current.getUTCDay() === 0) {
        const key = current.toISOString().slice(0, 10);
        holiday.push(key);
        holidaySet.add(key);
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    for (const [dateKey, counts] of dateMap.entries()) {
      if (counts.booked === counts.total) {
        booked.push(dateKey);
      } else {
        available.push(dateKey);
      }
    }

    return { booked, available, holiday };
    
  } catch (err) {
    return [];
  }
};
