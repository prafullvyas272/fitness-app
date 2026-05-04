import prisma from "../utils/prisma.js";

const getPeriodRange = (period) => {
  const now = new Date();
  const start = new Date(now);

  if (period === "monthly") {
    start.setDate(now.getDate() - 30);
  } else if (period === "yearly") {
    start.setFullYear(now.getFullYear() - 1);
  } else {
    // weekly default
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end: now };
};

const buildChartData = (bookings, period) => {
  const now = new Date();

  if (period === "yearly") {
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(now.getMonth() - (11 - i));
      return {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    });

    return months.map(({ label, year, month }) => ({
      label,
      bookings: bookings.filter((b) => {
        const d = new Date(b.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length,
    }));
  }

  if (period === "monthly") {
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (3 - i) * 7 - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { label: `Week ${i + 1}`, start: weekStart, end: weekEnd };
    });

    return weeks.map(({ label, start, end }) => ({
      label,
      bookings: bookings.filter((b) => {
        const d = new Date(b.createdAt);
        return d >= start && d <= end;
      }).length,
    }));
  }

  // weekly — last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toISOString().split("T")[0],
    };
  });

  return days.map(({ label, date }) => ({
    label,
    bookings: bookings.filter((b) => {
      return new Date(b.createdAt).toISOString().split("T")[0] === date;
    }).length,
  }));
};

export const getTrainerDashboard = async (trainerId, period = "weekly") => {
  const { start, end } = getPeriodRange(period);

  const [allBookings, clients] = await Promise.all([
    prisma.trainerBooking.findMany({
      where: {
        trainerId,
        isCancelled: false,
        createdAt: { gte: start, lte: end },
      },
      select: { bookingStatus: true, createdAt: true },
    }),
    prisma.assignedCustomer.count({
      where: { trainerId, isActive: true },
    }),
  ]);

  const booked = allBookings.length;
  const attended = allBookings.filter((b) => b.bookingStatus === "ATTENDED").length;
  const sessionCompleted = `${booked > 0 ? Math.round((attended / booked) * 100) : 0}%`;
  const chartData = buildChartData(allBookings, period);

  return {
    sessionCompleted,
    booked,
    attended,
    clients,
    gymRent: 0,
    chartData,
  };
};
