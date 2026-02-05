export const getDashboardAnalytics = async (userId) => {
  return {
    success: true,
    data: {
      weekly: {
        summary: {
          sessionsCompletedPercentage: 92,
          booked: 20,
          attended: 18,
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
          sessionsCompletedPercentage: 87,
          booked: 87,
          attended: 55,
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
          sessionsCompletedPercentage: 90,
          booked: 960,
          attended: 840,
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
