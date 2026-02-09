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
          chart: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            data: [48, 55, 60, 47]
          }
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