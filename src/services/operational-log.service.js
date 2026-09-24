import prisma from "../utils/prisma.js";

export const createOperationalLog = async (mentorId, data) => {
  try {
    const { ptId, date, activityType, hours, minutes, notes } = data;

    if (!ptId || !date || !activityType) {
      throw new Error("ptId, date, and activityType are required");
    }

    if ((hours === undefined || hours === null) && (minutes === undefined || minutes === null)) {
      throw new Error("Either hours or minutes must be provided");
    }

    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor) throw new Error("Mentor not found");

    const trainer = await prisma.user.findUnique({ where: { id: ptId } });
    if (!trainer) throw new Error("Trainer not found");

    const assignment = await prisma.mentorTrainerAssignment.findFirst({
      where: { mentorId, trainerId: ptId },
    });
    if (!assignment) throw new Error("Trainer not assigned to you");

    const durationMinutes = (hours || 0) * 60 + (minutes || 0);

    const log = await prisma.operationalLog.create({
      data: {
        mentorId,
        trainerId: ptId,
        date: new Date(date),
        activityType,
        durationMinutes,
        notes: notes || null,
      },
      include: {
        trainer: {
          select: { id: true, firstName: true, lastName: true, userProfileDetails: true },
        },
      },
    });

    return {
      id: log.id,
      trainer: {
        id: log.trainer.id,
        name: `${log.trainer.firstName} ${log.trainer.lastName}`,
        avatarUrl: log.trainer.userProfileDetails?.[0]?.avatarUrl || null,
      },
      date: log.date.toISOString().split("T")[0],
      activityType: log.activityType,
      durationMinutes: log.durationMinutes,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    };
  } catch (err) {
    throw new Error(`Failed to create log: ${err.message}`);
  }
};

export const getOperationalLogs = async (mentorId, page = 1, limit = 20) => {
  try {
    if (page < 1) page = 1;
    const skip = (page - 1) * limit;

    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor) throw new Error("Mentor not found");

    const [logs, total] = await Promise.all([
      prisma.operationalLog.findMany({
        where: { mentorId },
        skip,
        take: limit,
        include: {
          trainer: {
            select: { id: true, firstName: true, lastName: true, userProfileDetails: true },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.operationalLog.count({ where: { mentorId } }),
    ]);

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      trainer: {
        id: log.trainer.id,
        name: `${log.trainer.firstName} ${log.trainer.lastName}`,
        avatarUrl: log.trainer.userProfileDetails?.[0]?.avatarUrl || null,
      },
      date: log.date.toISOString().split("T")[0],
      activityType: log.activityType,
      durationMinutes: log.durationMinutes,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    throw new Error(`Failed to fetch logs: ${err.message}`);
  }
};

export const getOperationalLogById = async (mentorId, logId) => {
  try {
    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor) throw new Error("Mentor not found");

    const log = await prisma.operationalLog.findFirst({
      where: { id: logId, mentorId },
      include: {
        trainer: {
          select: { id: true, firstName: true, lastName: true, userProfileDetails: true },
        },
      },
    });

    if (!log) throw new Error("Log not found");

    return {
      id: log.id,
      trainer: {
        id: log.trainer.id,
        name: `${log.trainer.firstName} ${log.trainer.lastName}`,
        avatarUrl: log.trainer.userProfileDetails?.[0]?.avatarUrl || null,
      },
      date: log.date.toISOString().split("T")[0],
      activityType: log.activityType,
      durationMinutes: log.durationMinutes,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    };
  } catch (err) {
    throw new Error(`Failed to fetch log: ${err.message}`);
  }
};

export const getOperationalLogStats = async (mentorId) => {
  try {
    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor) throw new Error("Mentor not found");

    const logs = await prisma.operationalLog.findMany({
      where: { mentorId },
      select: { durationMinutes: true },
    });

    const totalDurationMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
    const pendingAudits = Math.max(0, Math.floor(Math.random() * 15)); // Replace with actual pending audits logic

    return {
      totalDurationMinutes,
      pendingAudits,
    };
  } catch (err) {
    throw new Error(`Failed to fetch stats: ${err.message}`);
  }
};

export const deleteOperationalLog = async (mentorId, logId) => {
  try {
    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor) throw new Error("Mentor not found");

    const log = await prisma.operationalLog.findFirst({
      where: { id: logId, mentorId },
    });

    if (!log) throw new Error("Log not found");

    await prisma.operationalLog.delete({ where: { id: logId } });

    return { success: true, message: "Log deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete log: ${err.message}`);
  }
};
