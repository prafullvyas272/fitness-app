import prisma from "../utils/prisma.js";

/**
 * Get a paginated list of TrainerTimeSlot entries by trainerId and date.
 * 
 */
export const getTrainerSlotsByDate = async ( trainerId, date, page = 1, pageSize = 10 ) => {
  if (!trainerId) {
    throw new Error("TrainerId is required");
  }
  if (!date) {
    throw new Error("Date is required");
  }
  let startOfDay, endOfDay;
  try {
    startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  } catch {
    throw new Error("Invalid date format");
  }
  const skip = (page - 1) * pageSize;
  const whereQuery = {
    trainerId,
    date: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };
  const [total, slots] = await Promise.all([
    prisma.trainerTimeSlot.count({
      where: whereQuery,
    }),
    prisma.trainerTimeSlot.findMany({
      where: whereQuery,
      orderBy: { startTime: "asc" },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    slots,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
