import prisma from "../utils/prisma.js";

export const createCustomerReport = async (trainerId, bookingId, data) => {
  try {
    const { customerId, reason, description } = data;

    if (!trainerId || !bookingId || !customerId || !reason) {
      throw new Error("trainerId, bookingId, customerId, and reason are required");
    }

    const booking = await prisma.trainerBooking.findUnique({
      where: { id: bookingId },
      select: { trainerId: true, customerId: true, bookingStatus: true, updatedAt: true }
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.trainerId !== trainerId) {
      throw new Error("Unauthorized - this booking doesn't belong to you");
    }

    if (booking.customerId !== customerId) {
      throw new Error("Customer ID mismatch");
    }

    if (booking.bookingStatus !== "ATTENDED") {
      throw new Error("Can only report after session is marked as ATTENDED");
    }

    const attendedTime = booking.updatedAt;
    const currentTime = new Date();
    const timeDifferenceHours = (currentTime - attendedTime) / (1000 * 60 * 60);

    if (timeDifferenceHours > 24) {
      throw new Error("Report can only be submitted within 24 hours of session attended");
    }

    const existingReport = await prisma.customerReport.findFirst({
      where: {
        bookingId,
        trainerId
      }
    });

    if (existingReport) {
      throw new Error("Report already exists for this booking");
    }

    const report = await prisma.customerReport.create({
      data: {
        trainerId,
        bookingId,
        customerId,
        reason,
        description: description || null,
        status: "PENDING",
        createdAt: new Date()
      },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        booking: { select: { id: true, timeSlot: true } }
      }
    });

    return report;
  } catch (err) {
    throw new Error(`Failed to create report: ${err.message}`);
  }
};

export const getCustomerReportsByAdmin = async (page = 1, pageSize = 10, status = null) => {
  try {
    const skip = (page - 1) * pageSize;

    const where = status ? { status } : {};

    const [reports, total] = await Promise.all([
      prisma.customerReport.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          trainer: { select: { id: true, firstName: true, lastName: true, email: true } },
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          booking: { select: { id: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.customerReport.count({ where })
    ]);

    return {
      reports,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  } catch (err) {
    throw new Error(`Failed to fetch reports: ${err.message}`);
  }
};

export const getCustomerReportsByTrainer = async (trainerId, page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    const [reports, total] = await Promise.all([
      prisma.customerReport.findMany({
        where: { trainerId },
        skip,
        take: pageSize,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          booking: { select: { id: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.customerReport.count({ where: { trainerId } })
    ]);

    return {
      reports,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  } catch (err) {
    throw new Error(`Failed to fetch reports: ${err.message}`);
  }
};

export const getCustomerReportsByCustomer = async (customerId, page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    const [reports, total] = await Promise.all([
      prisma.customerReport.findMany({
        where: { customerId },
        skip,
        take: pageSize,
        include: {
          trainer: { select: { id: true, firstName: true, lastName: true, email: true } },
          booking: { select: { id: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.customerReport.count({ where: { customerId } })
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
    const report = await prisma.customerReport.findFirst({
      where: { bookingId },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true } },
        customer: { select: { id: true, firstName: true, lastName: true } }
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

    const report = await prisma.customerReport.update({
      where: { id: reportId },
      data: {
        status,
        resolvedBy: adminId,
        resolvedAt: new Date()
      },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true } },
        customer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return report;
  } catch (err) {
    throw new Error(`Failed to update report: ${err.message}`);
  }
};

export const deleteReport = async (reportId, trainerId) => {
  try {
    const report = await prisma.customerReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.trainerId !== trainerId) {
      throw new Error("Unauthorized - you can only delete your own report");
    }

    await prisma.customerReport.delete({
      where: { id: reportId }
    });

    return { success: true, message: "Report deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete report: ${err.message}`);
  }
};
