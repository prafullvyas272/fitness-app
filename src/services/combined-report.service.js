import prisma from "../utils/prisma.js";

const customerSelect = { id: true, firstName: true, lastName: true, email: true, phone: true };
const trainerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  userProfileDetails: { select: { hostGymName: true, hostGymAddress: true } },
};
const bookingSelect = { select: { id: true, timeSlot: { select: { date: true, startTime: true, endTime: true } } } };

const formatTrainerReport = (r) => ({
  reportType: "CUSTOMER_REPORTED_TRAINER",
  id: r.id,
  bookingId: r.bookingId,
  reason: r.reason,
  description: r.description,
  status: r.status,
  resolvedBy: r.resolvedBy,
  resolvedAt: r.resolvedAt,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  customer: r.customer
    ? {
        id: r.customer.id,
        name: `${r.customer.firstName || ""} ${r.customer.lastName || ""}`.trim(),
        email: r.customer.email,
        phone: r.customer.phone,
      }
    : null,
  trainer: r.trainer
    ? {
        id: r.trainer.id,
        name: `${r.trainer.firstName || ""} ${r.trainer.lastName || ""}`.trim(),
        email: r.trainer.email,
        phone: r.trainer.phone,
        hostGymName: r.trainer.userProfileDetails?.[0]?.hostGymName || "",
        hostGymAddress: r.trainer.userProfileDetails?.[0]?.hostGymAddress || "",
      }
    : null,
  booking: r.booking || null,
  mentor: r.mentor || null,
});

const formatTrainerCustomerReport = (r) => ({
  reportType: "TRAINER_REPORTED_CUSTOMER",
  id: r.id,
  bookingId: r.bookingId,
  reason: r.reason,
  description: r.description,
  status: r.status,
  resolvedBy: r.resolvedBy,
  resolvedAt: r.resolvedAt,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  customer: r.customer
    ? {
        id: r.customer.id,
        name: `${r.customer.firstName || ""} ${r.customer.lastName || ""}`.trim(),
        email: r.customer.email,
        phone: r.customer.phone,
      }
    : null,
  trainer: r.trainer
    ? {
        id: r.trainer.id,
        name: `${r.trainer.firstName || ""} ${r.trainer.lastName || ""}`.trim(),
        email: r.trainer.email,
        phone: r.trainer.phone,
        hostGymName: r.trainer.userProfileDetails?.[0]?.hostGymName || "",
        hostGymAddress: r.trainer.userProfileDetails?.[0]?.hostGymAddress || "",
      }
    : null,
  booking: r.booking || null,
  mentor: r.mentor || null,
});

const fetchMergedReports = async ({ trainerFilter = null, status = null, reportType = null, page = 1, pageSize = 10 } = {}) => {
  const safePage = Math.max(parseInt(page) || 1, 1);
  const safePageSize = Math.min(Math.max(parseInt(pageSize) || 10, 1), 100);

  const where = {
    ...(status ? { status } : {}),
    ...(trainerFilter ? { trainerId: trainerFilter } : {}),
  };

  const [trainerReports, trainerCustomerReports] = await Promise.all([
    reportType === "TRAINER_REPORTED_CUSTOMER"
      ? []
      : prisma.trainerReport.findMany({
          where,
          include: {
            customer: { select: customerSelect },
            trainer: { select: trainerSelect },
            booking: bookingSelect,
            mentor: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
    reportType === "CUSTOMER_REPORTED_TRAINER"
      ? []
      : prisma.trainerCustomerReport.findMany({
          where,
          include: {
            customer: { select: customerSelect },
            trainer: { select: trainerSelect },
            booking: bookingSelect,
            mentor: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
  ]);

  const merged = [
    ...trainerReports.map(formatTrainerReport),
    ...trainerCustomerReports.map(formatTrainerCustomerReport),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = merged.length;
  const skip = (safePage - 1) * safePageSize;
  const pageItems = merged.slice(skip, skip + safePageSize);

  return {
    reports: pageItems,
    pagination: {
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize),
    },
  };
};

/**
 * Admin: unified list of every report filed by a customer against a trainer
 * (TrainerReport) and every report filed by a trainer against a customer
 * (TrainerCustomerReport), merged and sorted by createdAt desc. Pagination
 * is applied to the merged, sorted set.
 */
export const getAllReportsForAdmin = async ({ page = 1, pageSize = 10, status = null, reportType = null } = {}) => {
  return fetchMergedReports({ status, reportType, page, pageSize });
};

/**
 * Mentor: same unified report list, scoped to trainers assigned to this
 * mentor. trainerId, if given, must be one of the mentor's own assigned
 * trainers.
 */
export const getAllReportsForMentor = async (
  mentorId,
  { trainerId = null, page = 1, pageSize = 10, status = null, reportType = null } = {}
) => {
  const assignedTrainers = await prisma.mentorTrainerAssignment.findMany({
    where: { mentorId },
    select: { trainerId: true },
  });
  const assignedTrainerIds = assignedTrainers.map((a) => a.trainerId);

  if (assignedTrainerIds.length === 0) {
    return {
      reports: [],
      pagination: { total: 0, page: Number(page) || 1, pageSize: Number(pageSize) || 10, totalPages: 0 },
    };
  }

  if (trainerId && !assignedTrainerIds.includes(trainerId)) {
    throw new Error("Unauthorized - this trainer is not assigned to you");
  }

  return fetchMergedReports({
    trainerFilter: trainerId ? trainerId : { in: assignedTrainerIds },
    status,
    reportType,
    page,
    pageSize,
  });
};

const reportInclude = {
  customer: { select: customerSelect },
  trainer: { select: trainerSelect },
  booking: bookingSelect,
  mentor: { select: { id: true, firstName: true, lastName: true } },
};

/**
 * Mentor: mark a report as resolved. Works for either report direction
 * (CUSTOMER_REPORTED_TRAINER -> TrainerReport, TRAINER_REPORTED_CUSTOMER ->
 * TrainerCustomerReport), as long as the report's trainer is assigned to
 * this mentor. The same row is what GET /api/admin/reports reads, so the
 * status change is immediately visible there too.
 */
export const resolveReportForMentor = async (mentorId, reportId, reportType) => {
  if (!["CUSTOMER_REPORTED_TRAINER", "TRAINER_REPORTED_CUSTOMER"].includes(reportType)) {
    throw new Error("reportType must be CUSTOMER_REPORTED_TRAINER or TRAINER_REPORTED_CUSTOMER");
  }

  const model = reportType === "CUSTOMER_REPORTED_TRAINER" ? prisma.trainerReport : prisma.trainerCustomerReport;
  const formatter = reportType === "CUSTOMER_REPORTED_TRAINER" ? formatTrainerReport : formatTrainerCustomerReport;

  const existing = await model.findUnique({ where: { id: reportId } });
  if (!existing) {
    throw new Error("Report not found");
  }

  const assignment = await prisma.mentorTrainerAssignment.findFirst({
    where: { mentorId, trainerId: existing.trainerId },
  });
  if (!assignment) {
    throw new Error("Unauthorized - this report's trainer is not assigned to you");
  }

  const updated = await model.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolvedBy: mentorId, resolvedAt: new Date() },
    include: reportInclude,
  });

  return formatter(updated);
};
