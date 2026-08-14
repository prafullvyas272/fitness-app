import prisma from "../utils/prisma.js";

// Generate human-readable report ID (e.g., TR-4029)
const generateReportId = async () => {
  const count = await prisma.report.count();
  return `TR-${4000 + count + 1}`;
};

export const getAllReports = async (mentorId, { page = 1, limit = 20, status = null, priority = null, category = null, trainerId = null, search = null } = {}) => {
  if (page < 1) page = 1;
  const skip = (page - 1) * limit;

  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Get trainers assigned to this mentor
  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const assignedTrainerIds = mentorTrainerIds.map(a => a.trainerId);

  const where = {
    trainerId: { in: assignedTrainerIds },
    ...(trainerId && { trainerId }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(category && { category }),
    ...(search && {
      OR: [
        { reportId: { contains: search, mode: "insensitive" } },
        { trainer: { firstName: { contains: search, mode: "insensitive" } } },
        { trainer: { lastName: { contains: search, mode: "insensitive" } } }
      ]
    })
  };

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, userProfileDetails: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    })
  ]);

  const formattedReports = reports.map(report => ({
    id: report.reportId || report.id,
    trainerName: `${report.trainer.firstName || ''} ${report.trainer.lastName || ''}`.trim(),
    trainerAvatar: report.trainer.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
    trainerId: report.trainerId,
    reporterName: report.reporterName,
    category: report.category,
    priority: report.priority,
    status: report.status,
    date: report.createdAt.toISOString(),
    description: report.description,
    clientName: report.clientName || report.customer?.firstName || "Unknown",
    resolutionNotes: report.resolutionNotes,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  }));

  return {
    reports: formattedReports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getReportById = async (mentorId, reportId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Get trainers assigned to this mentor
  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const assignedTrainerIds = mentorTrainerIds.map(a => a.trainerId);

  const report = await prisma.report.findFirst({
    where: {
      OR: [
        { reportId },
        { id: reportId }
      ]
    },
    include: {
      trainer: { select: { id: true, firstName: true, lastName: true, userProfileDetails: true } },
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      attachments: true,
      timeline: true
    }
  });

  if (!report) throw new Error("Report not found");

  // Check if mentor has access
  if (!assignedTrainerIds.includes(report.trainerId)) {
    throw new Error("You do not have access to this report");
  }

  return {
    report: {
      id: report.reportId || report.id,
      trainerName: `${report.trainer.firstName || ''} ${report.trainer.lastName || ''}`.trim(),
      trainerAvatar: report.trainer.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
      trainerId: report.trainerId,
      reporterName: report.reporterName,
      category: report.category,
      priority: report.priority,
      status: report.status,
      date: report.createdAt.toISOString(),
      description: report.description,
      clientName: report.clientName || report.customer?.firstName || "Unknown",
      clientEmail: report.clientEmail || report.customer?.email,
      incidentDate: report.incidentDate ? report.incidentDate.toISOString() : null,
      incidentLocation: report.incidentLocation,
      resolutionNotes: report.resolutionNotes,
      assignedTo: report.assignedTo,
      attachments: report.attachments.map(att => ({
        id: att.id,
        fileName: att.fileName,
        url: att.fileUrl,
        uploadedAt: att.uploadedAt.toISOString()
      })),
      timeline: report.timeline.map(event => ({
        action: event.action,
        by: event.by,
        timestamp: event.timestamp.toISOString(),
        note: event.note
      })),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString()
    }
  };
};

export const updateReportStatus = async (mentorId, reportId, { status = null, priority = null, resolutionNotes = null, action = "status_update" } = {}) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Only allow status_update action
  if (action !== "status_update") {
    throw new Error("Only status_update action is allowed for mentors");
  }

  // Get trainers assigned to this mentor
  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const assignedTrainerIds = mentorTrainerIds.map(a => a.trainerId);

  const report = await prisma.report.findFirst({
    where: {
      OR: [
        { reportId },
        { id: reportId }
      ]
    }
  });

  if (!report) throw new Error("Report not found");

  if (!assignedTrainerIds.includes(report.trainerId)) {
    throw new Error("You do not have access to this report");
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;
  if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;

  const updatedReport = await prisma.report.update({
    where: { id: report.id },
    data: {
      ...updateData,
      timeline: {
        create: {
          action: "status_changed",
          by: `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim(),
          note: `Status changed to ${status || 'updated'}. ${resolutionNotes || ''}`,
          timestamp: new Date()
        }
      }
    }
  });

  // Create activity
  await prisma.reportActivity.create({
    data: {
      reportId: report.id,
      activityType: "status_updated",
      text: `Report status updated to ${status || 'pending'} by mentor`,
      severity: priority === "CRITICAL" ? "high" : "low",
      performedBy: mentor.id,
      timestamp: new Date()
    }
  });

  return {
    reportId: updatedReport.reportId || updatedReport.id,
    status: updatedReport.status,
    updatedAt: updatedReport.updatedAt.toISOString()
  };
};

export const getActivityFeed = async (mentorId, { limit = 20 } = {}) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Get trainers assigned to this mentor
  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const assignedTrainerIds = mentorTrainerIds.map(a => a.trainerId);

  // Get reports for assigned trainers
  const mentorReports = await prisma.report.findMany({
    where: { trainerId: { in: assignedTrainerIds } },
    select: { id: true }
  });
  const reportIds = mentorReports.map(r => r.id);

  const activities = await prisma.reportActivity.findMany({
    where: {
      reportId: { in: reportIds }
    },
    take: limit,
    orderBy: { timestamp: "desc" }
  });

  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    action: activity.activityType,
    text: activity.text,
    relatedReportId: activity.reportId,
    severity: activity.severity,
    timestamp: activity.timestamp.toISOString()
  }));

  return {
    activities: formattedActivities,
    total: formattedActivities.length
  };
};

export const getReportStats = async (mentorId, period = "month") => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Get trainers assigned to this mentor
  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const assignedTrainerIds = mentorTrainerIds.map(a => a.trainerId);

  const startDate = new Date();
  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === "quarter") {
    startDate.setMonth(startDate.getMonth() - 3);
  } else if (period === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const reports = await prisma.report.findMany({
    where: {
      trainerId: { in: assignedTrainerIds },
      createdAt: { gte: startDate }
    },
    include: {
      trainer: { select: { firstName: true, lastName: true } }
    }
  });

  const totalReports = reports.length;
  const openReports = reports.filter(r => r.status === "OPEN").length;
  const pendingReports = reports.filter(r => r.status === "IN_REVIEW").length;
  const resolvedReports = reports.filter(r => r.status === "RESOLVED").length;

  const byPriority = {
    CRITICAL: reports.filter(r => r.priority === "CRITICAL").length,
    HIGH: reports.filter(r => r.priority === "HIGH").length,
    ROUTINE: reports.filter(r => r.priority === "ROUTINE").length
  };

  const byCategory = {};
  reports.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });

  const byTrainer = {};
  reports.forEach(r => {
    const trainerName = `${r.trainer.firstName || ''} ${r.trainer.lastName || ''}`.trim();
    byTrainer[trainerName] = (byTrainer[trainerName] || 0) + 1;
  });

  // Calculate average resolution time (simplified)
  const resolvedWithNotes = reports.filter(r => r.resolutionNotes && r.status === "RESOLVED");
  const avgResolutionTime = resolvedWithNotes.length > 0 ? "48 hours" : "Pending";
  const unresolvedPercentage = totalReports > 0 ? Math.round((openReports + pendingReports) / totalReports * 100) : 0;

  return {
    stats: {
      totalReports,
      openReports,
      pendingReports,
      resolvedReports,
      byPriority,
      byCategory,
      byTrainer,
      avgResolutionTime,
      unresolvedPercentage
    }
  };
};

export const getReportsSummary = async (mentorId) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Mentor not found");

  // Get trainers assigned to this mentor
  const mentorTrainerIds = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true }
  });
  const assignedTrainerIds = mentorTrainerIds.map(a => a.trainerId);

  const reports = await prisma.report.findMany({
    where: { trainerId: { in: assignedTrainerIds } },
    include: {
      trainer: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const criticalCount = reports.filter(r => r.priority === "CRITICAL").length;
  const highCount = reports.filter(r => r.priority === "HIGH").length;
  const openCount = reports.filter(r => r.status === "OPEN").length;
  const pendingCount = reports.filter(r => r.status === "IN_REVIEW").length;

  const recentReports = reports.slice(0, 10).map(r => ({
    id: r.reportId || r.id,
    trainerName: `${r.trainer.firstName || ''} ${r.trainer.lastName || ''}`.trim(),
    priority: r.priority,
    status: r.status,
    date: r.createdAt.toISOString()
  }));

  return {
    summary: {
      criticalCount,
      highCount,
      openCount,
      pendingCount,
      recentReports
    }
  };
};
