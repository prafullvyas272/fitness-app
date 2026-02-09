import prisma from "../utils/prisma.js";
import { getMonthStartAndEndDates, getWeekStartAndEndDates, getYearStartAndEndDates } from "../utils/date.js";

export const getDashboardAnalytics = async (userId) => {

  // Get weekly summary data
  const { weekStartDate, weekEndDate } = getWeekStartAndEndDates(new Date());
  const weeklySummaryData = await getDashboardSummaryDataByDates(userId, weekStartDate, weekEndDate);

  // Get month summary data
  const { monthStartDate, monthEndDate } = getMonthStartAndEndDates(new Date());
  const monthlySummaryData = await getDashboardSummaryDataByDates(userId, monthStartDate, monthEndDate);

  // Get year summary data
  const { yearStartDate, yearEndDate } = getYearStartAndEndDates(new Date());
  const yearlySummaryData = await getDashboardSummaryDataByDates(userId, yearStartDate, yearEndDate);

  // Get Month booking stats
  const monthlyBookingStats = await getMonthlyBookingStats(userId);

  return {
    success: true,
    data: {
      weekly: {
        summary: {
          sessionsCompletedPercentage: weeklySummaryData.sessionsCompletedPercentage,
          booked: weeklySummaryData.booked,
          attended: weeklySummaryData.attended,
        },
        bookingStatistics: {
          totalSessions: 50,
          trend: "up",
          chart: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [5, 8, 6, 7, 9, 10, 5]
          }
        }
      },
      monthly: {
        summary: {
          sessionsCompletedPercentage: monthlySummaryData.sessionsCompletedPercentage,
          booked: monthlySummaryData.booked,
          attended: monthlySummaryData.attended,
        },
        bookingStatistics: {
          totalSessions: 210,
          trend: "stable",
          data: monthlyBookingStats,
        }
      },
      yearly: {
        summary: {
          sessionsCompletedPercentage: yearlySummaryData.sessionsCompletedPercentage,
          booked: yearlySummaryData.booked,
          attended: yearlySummaryData.attended,
        },
        bookingStatistics: {
          totalSessions: 2400,
          trend: "up",
          chart: {
            labels: [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            data: [180, 190, 210, 200, 220, 230, 210, 205, 215, 220, 200, 220]
          }
        }
      },
      nextSession: {
        clientName: "Aaron Wall",
        sessionDate: "2026-01-30",
        sessionTime: "09:00",
        location: "Gym",
        actions: {
          canReschedule: true,
          canCancel: true
        }
      },
      totalWorkingHours: 22
    }
  };
};


export const getDashboardSummaryDataByDates = async (trainerId, startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalBookedSlots = await prisma.trainerTimeSlot.count({
      where: {
        trainerId: trainerId,
        isBooked: true,
        date: {
          gte: start,
          lte: end,
        }
      }
    });

    const totalAttendedSlots = await prisma.trainerBooking.count({
      where: {
        trainerId: trainerId,
        isAttendedByTrainer: true,
        createdAt: {
          gte: start,
          lte: end,
        }
      }
    });

    const sessionsCompletedPercentage =
      totalBookedSlots > 0 ? (totalAttendedSlots / totalBookedSlots) * 100 : 0;

    return {
      booked: totalBookedSlots,
      attended: totalAttendedSlots,
      sessionsCompletedPercentage,
    };

  } catch (error) {
    console.error(error)
    return;
  }
}



export const getMonthlyBookingStats = async (trainerId) => {
  // 1. Fetch bookings with time slot info
  const bookings = await prisma.trainerBooking.findMany({
    where: { trainerId },
    include: {
      timeSlot: {
        select: {
          startTime: true,
          endTime: true,
          date: true
        }
      }
    }
  });

  // 2. Structure: month -> timeSlot -> count
  const monthlyMap = {};

  for (const booking of bookings) {
    const month = booking.timeSlot.date.getMonth(); // 0-based
    const startHour = booking.timeSlot.startTime.getHours();
    const endHour = booking.timeSlot.endTime.getHours();

    const slotLabel = `${startHour}-${endHour} PM`; // adjust AM/PM if needed

    if (!monthlyMap[month]) {
      monthlyMap[month] = {};
    }

    monthlyMap[month][slotLabel] =
      (monthlyMap[month][slotLabel] || 0) + 1;
  }

  // 3. Pick most popular slot per month
  const result = Object.keys(monthlyMap).map(month => {
    const slots = monthlyMap[month];

    let maxSlot = null;
    let maxCount = 0;

    for (const slot in slots) {
      if (slots[slot] > maxCount) {
        maxCount = slots[slot];
        maxSlot = slot;
      }
    }

    return {
      month: Number(month) + 1, // human-readable
      mostPopularTimeSlot: maxSlot,
      sessions: maxCount
    };
  });

  return result;
};
