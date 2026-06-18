import prisma from "../utils/prisma.js";

export const createTrainerIssueReport = async ({ trainerId, subject, category, priority, description }) => {
  return prisma.trainerIssueReport.create({
    data: {
      trainerId,
      subject,
      category,
      priority: priority || "ROUTINE",
      description: description || null,
      status: "OPEN",
    },
  });
};

export const getMyTrainerIssueReports = async (trainerId) => {
  return prisma.trainerIssueReport.findMany({
    where: { trainerId },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllTrainerIssueReports = async ({ page = 1, pageSize = 10, status, category, priority } = {}) => {
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(status   && { status }),
    ...(category && { category }),
    ...(priority && { priority }),
  };

  const [total, reports] = await Promise.all([
    prisma.trainerIssueReport.count({ where }),
    prisma.trainerIssueReport.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return {
    reports,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const updateTrainerIssueReportStatus = async (id, { status, adminNote }) => {
  const report = await prisma.trainerIssueReport.findUnique({ where: { id } });
  if (!report) throw new Error("Report not found");

  return prisma.trainerIssueReport.update({
    where: { id },
    data: {
      ...(status    && { status }),
      ...(adminNote !== undefined && { adminNote }),
    },
  });
};
