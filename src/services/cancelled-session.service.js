import prisma from "../utils/prisma.js";

const IST_OFFSET_MINUTES = 330; // Asia/Kolkata (+05:30)

/** "1:00pm" in IST — used for the slot time range display. */
const istHhmmDisplay = (dateObj) => {
  const istMs = new Date(dateObj).getTime() + IST_OFFSET_MINUTES * 60 * 1000;
  const istDate = new Date(istMs);
  let hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes}${ampm}`;
};

const formatCancelledBooking = (booking) => {
  const trainerProfile = booking.trainer?.userProfileDetails?.[0] || null;

  return {
    bookingId: booking.id,
    date: booking.timeSlot?.date || null,
    slotTime: booking.timeSlot
      ? `${istHhmmDisplay(booking.timeSlot.startTime)}-${istHhmmDisplay(booking.timeSlot.endTime)}`
      : null,
    customer: {
      id: booking.customer?.id || null,
      name: `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}`.trim(),
      email: booking.customer?.email || null,
      phone: booking.customer?.phone || null,
    },
    trainer: {
      id: booking.trainer?.id || null,
      name: `${booking.trainer?.firstName || ""} ${booking.trainer?.lastName || ""}`.trim(),
      hostGymName: trainerProfile?.hostGymName || "",
      hostGymAddress: trainerProfile?.hostGymAddress || "",
    },
    reason: booking.remarks || null,
    cancelledAt: booking.updatedAt,
  };
};

const fetchCancelledSessions = async (trainerFilter, { page = 1, pageSize = 10 } = {}) => {
  const safePage = Math.max(parseInt(page) || 1, 1);
  const safePageSize = Math.min(Math.max(parseInt(pageSize) || 10, 1), 100);
  const skip = (safePage - 1) * safePageSize;

  const where = {
    OR: [{ isCancelled: true }, { bookingStatus: "CANCELLED" }],
    ...(trainerFilter ? { trainerId: trainerFilter } : {}),
  };

  const [total, bookings] = await Promise.all([
    prisma.trainerBooking.count({ where }),
    prisma.trainerBooking.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: safePageSize,
      include: {
        timeSlot: { select: { date: true, startTime: true, endTime: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userProfileDetails: { select: { hostGymName: true, hostGymAddress: true } },
          },
        },
      },
    }),
  ]);

  return {
    sessions: bookings.map(formatCancelledBooking),
    pagination: {
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize),
    },
  };
};

/**
 * Admin: cancelled sessions across all trainers, optionally filtered to one.
 */
export const getCancelledSessionsForAdmin = async ({ trainerId = null, page = 1, pageSize = 10 } = {}) => {
  return fetchCancelledSessions(trainerId || null, { page, pageSize });
};

/**
 * Mentor: cancelled sessions scoped to trainers assigned to this mentor.
 * trainerId, if given, must be one of the mentor's own assigned trainers.
 */
export const getCancelledSessionsForMentor = async (mentorId, { trainerId = null, page = 1, pageSize = 10 } = {}) => {
  const assignedTrainers = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true },
  });
  const assignedTrainerIds = assignedTrainers.map((a) => a.trainerId);

  if (assignedTrainerIds.length === 0) {
    return {
      sessions: [],
      pagination: { total: 0, page: Number(page) || 1, pageSize: Number(pageSize) || 10, totalPages: 0 },
    };
  }

  if (trainerId && !assignedTrainerIds.includes(trainerId)) {
    throw new Error("Unauthorized - this trainer is not assigned to you");
  }

  return fetchCancelledSessions(trainerId ? trainerId : { in: assignedTrainerIds }, { page, pageSize });
};
