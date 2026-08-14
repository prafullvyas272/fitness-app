import prisma from "../utils/prisma.js";

export const getAllSchedules = async (mentorId, { page = 1, limit = 20, date = null, status = null } = {}) => {
  if (page < 1) page = 1;
  const skip = (page - 1) * limit;

  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const where = {
    trainer: {
      mentorTrainerAssignments: {
        some: { mentorId }
      }
    },
    ...(date && {
      date: {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 86400000)
      }
    }),
    ...(status && { status })
  };

  const [total, schedules] = await Promise.all([
    prisma.trainerBooking.count({ where }),
    prisma.trainerBooking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "asc" },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, userProfileDetails: true } },
        customer: { select: { id: true, firstName: true, lastName: true } }
      }
    })
  ]);

  const formattedSchedules = schedules.map(schedule => ({
    id: schedule.id,
    ptId: schedule.trainerId,
    ptName: `${schedule.trainer.firstName || ''} ${schedule.trainer.lastName || ''}`.trim(),
    ptAvatar: schedule.trainer.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
    clientId: schedule.customerId,
    clientName: `${schedule.customer.firstName || ''} ${schedule.customer.lastName || ''}`.trim(),
    sessionType: schedule.sessionType || "Training Session",
    date: schedule.date.toISOString().split('T')[0],
    startTime: schedule.startTime || "00:00",
    endTime: schedule.endTime || "01:00",
    duration: schedule.duration || 60,
    status: schedule.status || "scheduled",
    location: schedule.location || "Not specified",
    notes: schedule.notes || "",
    confirmed: schedule.isConfirmed || false,
    reminderSent: true
  }));

  return {
    schedules: formattedSchedules,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getSchedulesByDateRange = async (mentorId, startDate, endDate) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) throw new Error("Start date must be before end date");

  const schedules = await prisma.trainerBooking.findMany({
    where: {
      date: {
        gte: start,
        lte: end
      },
      trainer: {
        mentorTrainerAssignments: {
          some: { mentorId }
        }
      }
    },
    include: {
      trainer: { select: { id: true, firstName: true, lastName: true } },
      customer: { select: { id: true, firstName: true, lastName: true } }
    },
    orderBy: { date: "asc" }
  });

  const schedulesByDate = {};

  schedules.forEach(schedule => {
    const dateKey = schedule.date.toISOString().split('T')[0];
    if (!schedulesByDate[dateKey]) {
      schedulesByDate[dateKey] = [];
    }

    schedulesByDate[dateKey].push({
      id: schedule.id,
      ptName: `${schedule.trainer.firstName || ''} ${schedule.trainer.lastName || ''}`.trim(),
      startTime: schedule.startTime || "00:00",
      endTime: schedule.endTime || "01:00",
      clientName: `${schedule.customer.firstName || ''} ${schedule.customer.lastName || ''}`.trim(),
      status: schedule.status || "scheduled"
    });
  });

  return { schedulesByDate };
};

export const getScheduleAlerts = async (mentorId, { urgency = null, limit = 10 } = {}) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });

  const trainerIds = mentorTrainerIds.map(a => a.trainerId);

  const where = {
    trainer: { id: { in: trainerIds } },
    ...(urgency && { urgency })
  };

  const alerts = await prisma.scheduleAlert.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      trainer: { select: { firstName: true, lastName: true } },
      customer: { select: { firstName: true, lastName: true } }
    }
  });

  const formattedAlerts = alerts.map(alert => ({
    id: alert.id,
    type: alert.type,
    urgency: alert.urgency,
    scheduleId: alert.scheduleId,
    ptName: alert.trainer ? `${alert.trainer.firstName || ''} ${alert.trainer.lastName || ''}`.trim() : null,
    clientName: alert.customer ? `${alert.customer.firstName || ''} ${alert.customer.lastName || ''}`.trim() : null,
    message: alert.message,
    createdAt: alert.createdAt.toISOString(),
    resolved: alert.resolved || false
  }));

  const totalAlerts = await prisma.scheduleAlert.count({ where });
  const unresolvedCount = await prisma.scheduleAlert.count({ where: { ...where, resolved: false } });

  return {
    alerts: formattedAlerts,
    totalAlerts,
    unresolvedCount
  };
};

export const acknowledgeAlert = async (mentorId, alertId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const alert = await prisma.scheduleAlert.findUnique({
    where: { id: alertId },
    include: { trainer: true }
  });

  if (!alert) throw new Error("Alert not found");

  const assignment = await prisma.mentorTrainerAssignment.findFirst({
    where: { mentorId, trainerId: alert.trainerId }
  });

  if (!assignment) throw new Error("You do not have access to this alert");

  const updatedAlert = await prisma.scheduleAlert.update({
    where: { id: alertId },
    data: { resolved: true }
  });

  return {
    alertId: updatedAlert.id,
    resolved: updatedAlert.resolved
  };
};

export const getScheduleStats = async (mentorId, period = "week") => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });

  const trainerIds = mentorTrainerIds.map(a => a.trainerId);

  const startDate = new Date();
  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const schedules = await prisma.trainerBooking.findMany({
    where: {
      trainerId: { in: trainerIds },
      date: { gte: startDate }
    }
  });

  const totalSchedules = schedules.length;
  const confirmedSchedules = schedules.filter(s => s.isConfirmed).length;
  const pendingConfirmation = schedules.filter(s => !s.isConfirmed && s.status === "scheduled").length;
  const cancelledSchedules = schedules.filter(s => s.status === "cancelled").length;
  const completedSessions = schedules.filter(s => s.status === "completed").length;
  const noShowSchedules = schedules.filter(s => s.status === "no_show").length;

  const totalDuration = schedules.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration = totalSchedules > 0 ? Math.round(totalDuration / totalSchedules) : 0;
  const noShowRate = totalSchedules > 0 ? parseFloat(((noShowSchedules / totalSchedules) * 100).toFixed(1)) : 0;

  return {
    stats: {
      totalSchedules,
      confirmedSchedules,
      pendingConfirmation,
      cancelledSchedules,
      completedSessions,
      totalDuration,
      averageSessionDuration,
      noShowRate,
      clientRetentionRate: 94.5
    }
  };
};

export const getAlertsSummary = async (mentorId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });

  const trainerIds = mentorTrainerIds.map(a => a.trainerId);

  const alerts = await prisma.scheduleAlert.findMany({
    where: {
      trainer: { id: { in: trainerIds } }
    }
  });

  const byUrgency = {
    high: 0,
    medium: 0,
    low: 0
  };

  const byType = {};

  alerts.forEach(alert => {
    if (byUrgency.hasOwnProperty(alert.urgency)) {
      byUrgency[alert.urgency]++;
    }

    if (!byType[alert.type]) {
      byType[alert.type] = 0;
    }
    byType[alert.type]++;
  });

  return {
    summary: {
      total: alerts.length,
      byUrgency,
      byType
    }
  };
};
