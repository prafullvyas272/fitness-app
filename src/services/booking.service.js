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
        customer: {
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
        },
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
          timeSlotId
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
