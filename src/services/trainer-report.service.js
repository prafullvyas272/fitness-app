import prisma from "../utils/prisma.js";

export const createTrainerReport = async (customerId, bookingId, data) => {
  try {
    const { trainerId, reason, description } = data;

    if (!customerId || !bookingId || !trainerId || !reason) {
      throw new Error("customerId, bookingId, trainerId, and reason are required");
    }

    const booking = await prisma.trainerBooking.findUnique({
      where: { id: bookingId },
      select: { customerId: true, trainerId: true }
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.customerId !== customerId) {
      throw new Error("Unauthorized - this booking doesn't belong to you");
    }

    if (booking.trainerId !== trainerId) {
      throw new Error("Trainer ID mismatch");
    }

    const existingReport = await prisma.trainerReport.findFirst({
      where: {
        bookingId,
        customerId
      }
    });

    if (existingReport) {
      throw new Error("Report already exists for this booking");
    }

    const mentorAssignment = await prisma.mentorTrainerAssignment.findFirst({
      where: { trainerId },
      select: { mentorId: true }
    });

    const report = await prisma.trainerReport.create({
      data: {
        customerId,
        bookingId,
        trainerId,
        mentorId: mentorAssignment?.mentorId || null,
        reason,
        description: description || null,
        status: "PENDING",
        createdAt: new Date()
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        trainer: { select: { id: true, firstName: true, lastName: true, email: true } },
        mentor: { select: { id: true, firstName: true, lastName: true } },
        booking: { select: { id: true, timeSlot: true } }
      }
    });

    return report;
  } catch (err) {
    throw new Error(`Failed to create report: ${err.message}`);
  }
};

export const getTrainerReportsByAdmin = async (page = 1, pageSize = 10, status = null) => {
  try {
    const skip = (page - 1) * pageSize;

    const where = status ? { status } : {};

    const [reports, total] = await Promise.all([
      prisma.trainerReport.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          trainer: { select: { id: true, firstName: true, lastName: true, email: true } },
          booking: { select: { id: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.trainerReport.count({ where })
    ]);

    return {
      reports,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  } catch (err) {
    throw new Error(`Failed to fetch reports: ${err.message}`);
  }
};

export const getTrainerReportsByTrainer = async (trainerId, page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    const [reports, total] = await Promise.all([
      prisma.trainerReport.findMany({
        where: { trainerId },
        skip,
        take: pageSize,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          booking: { select: { id: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.trainerReport.count({ where: { trainerId } })
    ]);

    return {
      reports,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  } catch (err) {
    throw new Error(`Failed to fetch reports: ${err.message}`);
  }
};

export const getReportByBooking = async (bookingId) => {
  try {
    const report = await prisma.trainerReport.findFirst({
      where: { bookingId },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  } catch (err) {
    throw new Error(`Failed to fetch report: ${err.message}`);
  }
};

export const updateReportStatus = async (reportId, adminId, status) => {
  try {
    if (!["PENDING", "RESOLVED", "REJECTED"].includes(status)) {
      throw new Error("Invalid status. Must be PENDING, RESOLVED, or REJECTED");
    }

    const report = await prisma.trainerReport.update({
      where: { id: reportId },
      data: {
        status,
        resolvedBy: adminId,
        resolvedAt: new Date()
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return report;
  } catch (err) {
    throw new Error(`Failed to update report: ${err.message}`);
  }
};

export const deleteReport = async (reportId, customerId) => {
  try {
    const report = await prisma.trainerReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.customerId !== customerId) {
      throw new Error("Unauthorized - you can only delete your own report");
    }

    await prisma.trainerReport.delete({
      where: { id: reportId }
    });

    return { success: true, message: "Report deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete report: ${err.message}`);
  }
};
