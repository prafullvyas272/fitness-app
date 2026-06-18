import prisma from "../utils/prisma.js";

export const createCustomerReport = async ({ customerId, subject, category, priority, description }) => {
  return prisma.customerReport.create({
    data: {
      customerId,
      subject,
      category,
      priority: priority || "ROUTINE",
      description: description || null,
      status: "OPEN",
    },
  });
};

export const getMyCustomerReports = async (customerId) => {
  return prisma.customerReport.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllCustomerReports = async ({ page = 1, pageSize = 10, status, category, priority } = {}) => {
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(status   && { status }),
    ...(category && { category }),
    ...(priority && { priority }),
  };

  const [total, reports] = await Promise.all([
    prisma.customerReport.count({ where }),
    prisma.customerReport.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
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

export const updateCustomerReportStatus = async (id, { status, adminNote }) => {
  const report = await prisma.customerReport.findUnique({ where: { id } });
  if (!report) throw new Error("Report not found");

  return prisma.customerReport.update({
    where: { id },
    data: {
      ...(status    && { status }),
      ...(adminNote !== undefined && { adminNote }),
    },
  });
};
