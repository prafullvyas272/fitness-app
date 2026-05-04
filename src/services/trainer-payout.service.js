import prisma from "../utils/prisma.js";

export const createTrainerPayout = async (trainerId, data) => {
  const { totalPayout, netPayout, note, periodStart, periodEnd } = data;

  if (totalPayout === undefined || netPayout === undefined) {
    throw new Error("totalPayout and netPayout are required");
  }

  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: { id: true, role: { select: { name: true } } },
  });
  if (!trainer) throw new Error("Trainer not found");
  if (trainer.role.name !== "Trainer") throw new Error("User is not a trainer");

  return prisma.trainerPayout.create({
    data: {
      trainerId,
      totalPayout,
      netPayout,
      note: note || null,
      periodStart: periodStart ? new Date(periodStart) : null,
      periodEnd: periodEnd ? new Date(periodEnd) : null,
    },
  });
};

const getWeekRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const getTrainerPayoutHistory = async (trainerId, filter = {}) => {
  const { period, startDate, endDate, page = 1, pageSize = 20 } = filter;

  const where = { trainerId };

  if (startDate && endDate) {
    where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
  } else if (period === "weekly") {
    const { start, end } = getWeekRange();
    where.createdAt = { gte: start, lte: end };
  } else if (period === "monthly") {
    const { start, end } = getMonthRange();
    where.createdAt = { gte: start, lte: end };
  }

  const skip = (page - 1) * pageSize;

  const [total, payouts] = await Promise.all([
    prisma.trainerPayout.count({ where }),
    prisma.trainerPayout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(pageSize),
    }),
  ]);

  return {
    payouts,
    pagination: {
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
