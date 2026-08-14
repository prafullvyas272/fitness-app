import prisma from "../utils/prisma.js";

export const getDashboardOverview = async (mentorId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Get assigned trainers
  const assignedTrainers = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const trainerIds = assignedTrainers.map(a => a.trainerId);
  const totalAssignedPTs = trainerIds.length;

  // Get active PTs (with bookings in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeTrainerIds = new Set();
  const recentBookings = await prisma.trainerBooking.findMany({
    where: {
      trainerId: { in: trainerIds },
      createdAt: { gte: thirtyDaysAgo }
    },
    select: { trainerId: true }
  });
  recentBookings.forEach(b => activeTrainerIds.add(b.trainerId));
  const activePTs = activeTrainerIds.size;

  // Get at-risk PTs (rating < 3.5)
  const trainers = await prisma.user.findMany({
    where: { id: { in: trainerIds } },
    include: {
      receivedReviewsAsTrainer: { select: { rating: true } }
    }
  });

  let atRiskPTs = 0;
  let totalRating = 0;
  let totalReviews = 0;

  trainers.forEach(trainer => {
    if (trainer.receivedReviewsAsTrainer.length > 0) {
      const avgRating = trainer.receivedReviewsAsTrainer.reduce((sum, r) => sum + r.rating, 0) / trainer.receivedReviewsAsTrainer.length;
      totalRating += avgRating;
      totalReviews++;
      if (avgRating < 3.5) atRiskPTs++;
    }
  });

  const avgFeedbackScore = totalReviews > 0 ? (totalRating / totalReviews) : 0;

  // Get clients managed (distinct customers)
  const clientBookings = await prisma.trainerBooking.findMany({
    where: { trainerId: { in: trainerIds } },
    select: { customerId: true },
    distinct: ["customerId"]
  });
  const clientsManaged = clientBookings.length;

  // Get upcoming check-ins (future bookings)
  const now = new Date();
  const upcomingBookings = await prisma.trainerBooking.findMany({
    where: {
      trainerId: { in: trainerIds },
      timeSlot: {
        date: { gte: now }
      },
      bookingStatus: "PENDING"
    }
  });
  const upcomingCheckIns = upcomingBookings.length;

  // Get monthly operational hours (current month)
  const currentDate = new Date();
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const monthlyBookings = await prisma.trainerBooking.findMany({
    where: {
      trainerId: { in: trainerIds },
      timeSlot: {
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    },
    include: {
      timeSlot: { select: { durationMinutes: true } }
    }
  });

  const monthlyOperationalHours = Math.round(
    monthlyBookings.reduce((sum, b) => sum + (b.timeSlot?.durationMinutes || 0), 0) / 60
  );

  return {
    stats: {
      totalAssignedPTs,
      activePTs,
      atRiskPTs,
      clientsManaged,
      avgFeedbackScore: parseFloat(avgFeedbackScore.toFixed(1)),
      upcomingCheckIns,
      monthlyOperationalHours
    }
  };
};

export const getPerformanceTrajectory = async (mentorId, period = "7D") => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Get assigned trainers
  const assignedTrainers = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const trainerIds = assignedTrainers.map(a => a.trainerId);

  const days = period === "7D" ? 7 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get all reviews in period
  const reviews = await prisma.review.findMany({
    where: {
      trainerId: { in: trainerIds },
      createdAt: { gte: startDate }
    },
    select: {
      rating: true,
      createdAt: true
    }
  });

  // Group by date
  const scoresByDate = {};
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    scoresByDate[dateKey] = [];
  }

  reviews.forEach(review => {
    const dateKey = review.createdAt.toISOString().split('T')[0];
    if (scoresByDate[dateKey]) {
      scoresByDate[dateKey].push(review.rating);
    }
  });

  // Calculate daily averages and generate chart data
  const chartData = [];
  let previousScore = null;

  Object.entries(scoresByDate).forEach(([date, ratings]) => {
    const score = ratings.length > 0
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : null;

    let trend = "flat";
    if (score !== null && previousScore !== null) {
      trend = score > previousScore ? "up" : score < previousScore ? "down" : "flat";
    }

    if (score !== null) {
      chartData.push({
        date,
        score,
        trend
      });
      previousScore = score;
    }
  });

  // Generate labels (every other day for readability)
  const labels = [];
  chartData.forEach((item, index) => {
    if (days === 7 || index % 2 === 0) {
      const date = new Date(item.date);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      labels.push(`${month}/${day}`);
    }
  });

  // Calculate summary
  const allScores = chartData.map(d => d.score);
  const avgScore = allScores.length > 0
    ? parseFloat((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1))
    : 0;

  // Determine trend
  let overallTrend = "flat";
  if (allScores.length >= 2) {
    const firstHalf = allScores.slice(0, Math.ceil(allScores.length / 2));
    const secondHalf = allScores.slice(Math.ceil(allScores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    overallTrend = secondAvg > firstAvg ? "upward" : secondAvg < firstAvg ? "downward" : "flat";
  }

  // Calculate percentage change
  let percentChange = "0%";
  if (allScores.length >= 2) {
    const change = ((allScores[allScores.length - 1] - allScores[0]) / allScores[0]) * 100;
    const sign = change > 0 ? "+" : "";
    percentChange = `${sign}${change.toFixed(1)}%`;
  }

  return {
    period,
    chartData,
    labels,
    summary: {
      avgScore,
      trend: overallTrend,
      percentChange
    }
  };
};

export const getDashboardSummary = async (mentorId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const overview = await getDashboardOverview(mentorId);

  return {
    summary: {
      totalAssignedPTs: overview.stats.totalAssignedPTs,
      activePTs: overview.stats.activePTs,
      atRiskPTs: overview.stats.atRiskPTs,
      avgFeedbackScore: overview.stats.avgFeedbackScore,
      upcomingEvents: overview.stats.upcomingCheckIns,
      totalClientsManaged: overview.stats.clientsManaged
    }
  };
};
