import prisma from "../utils/prisma.js";

const IST_OFFSET_MINUTES = 330; // Asia/Kolkata (+05:30)

/** "HH:mm" in IST — used as the grouping key (unambiguous, 24h). */
const istHhmmKey = (dateObj) => {
  const istMs = new Date(dateObj).getTime() + IST_OFFSET_MINUTES * 60 * 1000;
  const istDate = new Date(istMs);
  const hh = String(istDate.getUTCHours()).padStart(2, "0");
  const mm = String(istDate.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/** "11:30 AM" in IST — used for the display label. */
const istHhmmDisplay = (dateObj) => {
  const istMs = new Date(dateObj).getTime() + IST_OFFSET_MINUTES * 60 * 1000;
  const istDate = new Date(istMs);
  let hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
};

/**
 * Among a bucket's bookings, finds the time-of-day range (ignoring calendar
 * date, so a 11:30-12:15 slot on two different days in the same bucket counts
 * together) that was booked most often.
 */
const getMostBookedSlot = (bucketBookings) => {
  const slotCounts = new Map();

  for (const b of bucketBookings) {
    if (!b.timeSlot?.startTime || !b.timeSlot?.endTime) continue;
    const key = `${istHhmmKey(b.timeSlot.startTime)}|${istHhmmKey(b.timeSlot.endTime)}`;
    const entry = slotCounts.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      slotCounts.set(key, {
        count: 1,
        startTime: b.timeSlot.startTime,
        endTime: b.timeSlot.endTime,
      });
    }
  }

  let best = null;
  for (const entry of slotCounts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }

  if (!best) {
    return { mostBookedTimeSlot: null, mostBookedTimeSlotCount: 0 };
  }

  return {
    mostBookedTimeSlot: `${istHhmmDisplay(best.startTime)} - ${istHhmmDisplay(best.endTime)}`,
    mostBookedTimeSlotCount: best.count,
  };
};

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

    return months.map(({ label, year, month }) => {
      const bucketBookings = bookings.filter((b) => {
        const d = new Date(b.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      return {
        label,
        bookings: bucketBookings.length,
        ...getMostBookedSlot(bucketBookings),
      };
    });
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

    return weeks.map(({ label, start, end }) => {
      const bucketBookings = bookings.filter((b) => {
        const d = new Date(b.createdAt);
        return d >= start && d <= end;
      });
      return {
        label,
        bookings: bucketBookings.length,
        ...getMostBookedSlot(bucketBookings),
      };
    });
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

  return days.map(({ label, date }) => {
    const bucketBookings = bookings.filter((b) => {
      return new Date(b.createdAt).toISOString().split("T")[0] === date;
    });
    return {
      label,
      bookings: bucketBookings.length,
      ...getMostBookedSlot(bucketBookings),
    };
  });
};

export const getTrainerDashboard = async (trainerId, period = "weekly") => {
  const { start, end } = getPeriodRange(period);

  const [allBookings, clients, latestPayout, gymRent] = await Promise.all([
    prisma.trainerBooking.findMany({
      where: {
        trainerId,
        isCancelled: false,
        createdAt: { gte: start, lte: end },
      },
      select: {
        bookingStatus: true,
        createdAt: true,
        timeSlot: { select: { durationMinutes: true, startTime: true, endTime: true } },
      },
    }),
    prisma.assignedCustomer.count({
      where: { trainerId, isActive: true },
    }),
    prisma.trainerPayout.findFirst({
      where: { trainerId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gymRent.findUnique({
      where: { trainerId },
      select: { rentAmount: true },
    }),
  ]);

  const booked = allBookings.length;
  const attended = allBookings.filter((b) => b.bookingStatus === "ATTENDED").length;
  const sessionCompleted = `${booked > 0 ? Math.round((attended / booked) * 100) : 0}%`;
  const chartData = buildChartData(allBookings, period);

  const totalWorkingMinutes = allBookings
    .filter((b) => b.bookingStatus === "ATTENDED")
    .reduce((sum, b) => sum + (b.timeSlot?.durationMinutes || 0), 0);
  const totalWorkingHours = parseFloat((totalWorkingMinutes / 60).toFixed(1));

  return {
    sessionCompleted,
    booked,
    attended,
    clients,
    gymRent: gymRent?.rentAmount ?? 0,
    totalWorkingHours,
    totalPayout: latestPayout?.totalPayout ?? null,
    netPayout: latestPayout?.netPayout ?? null,
    chartData,
  };
};
