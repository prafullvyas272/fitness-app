import prisma from "../utils/prisma.js";

export const createReport = async ({ trainerId, customerId, sessionDate, category, priority, description }) => {
  const customer = await prisma.user.findUnique({ where: { id: customerId }, select: { id: true } });
  if (!customer) throw new Error("Customer not found");

  return prisma.report.create({
    data: {
      trainerId,
      customerId,
      sessionDate: new Date(sessionDate),
      category,
      priority,
      description,
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
};

export const getAllReports = async ({ page = 1, pageSize = 10, category, priority, status } = {}) => {
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(category && { category }),
    ...(priority && { priority }),
    ...(status   && { status }),
  };

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        trainer:  { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
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

export const getReportById = async (id) => {
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      trainer:  { select: { id: true, firstName: true, lastName: true, email: true } },
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  if (!report) throw new Error("Report not found");
  return report;
};

export const updateReportStatus = async (id, { status, adminNote }) => {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new Error("Report not found");

  return prisma.report.update({
    where: { id },
    data: {
      ...(status    && { status }),
      ...(adminNote !== undefined && { adminNote }),
    },
    include: {
      trainer:  { select: { id: true, firstName: true, lastName: true, email: true } },
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
};
