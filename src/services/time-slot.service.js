import prisma from "../utils/prisma.js";

const IST_OFFSET_MINUTES = 330; // Asia/Kolkata (+05:30)

const parseYyyyMmDd = (dateStr) => {
  const [yearStr, monthStr, dayStr] = String(dateStr).split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error("Invalid date value.");
  }

  return { year, month, day };
};

const getUtcRangeForIstDate = (dateStr) => {
  const { year, month, day } = parseYyyyMmDd(dateStr);
  const startUtcMs =
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MINUTES * 60 * 1000;
  const endUtcMs =
    Date.UTC(year, month - 1, day, 23, 59, 59, 999) - IST_OFFSET_MINUTES * 60 * 1000;

  return {
    start: new Date(startUtcMs),
    end: new Date(endUtcMs),
  };
};

const getUtcDateTimeForIstDateAndTime = (dateStr, hhmm) => {
  const { year, month, day } = parseYyyyMmDd(dateStr);
  const [hourStr, minuteStr] = String(hhmm).split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Invalid time format. Use HH:mm.");
  }

  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, 0, 0) -
    IST_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcMs);
};

/**
 * Get a paginated list of TrainerTimeSlot entries by trainerId and date.
 * 
 */
export const getTrainerSlotsByDate = async ( trainerId, date, page = 1, pageSize = 10 ) => {
  if (!trainerId) {
    throw new Error("TrainerId is required");
  }
  if (!date) {
    throw new Error("Date is required");
  }
  const { start: startOfDay, end: endOfDay } = getUtcRangeForIstDate(date);
  const skip = (page - 1) * pageSize;
  const whereQuery = {
    trainerId,
    date: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };
  const [total, slots] = await Promise.all([
    prisma.trainerTimeSlot.count({
      where: whereQuery,
    }),
    prisma.trainerTimeSlot.findMany({
      where: whereQuery,
      orderBy: { startTime: "asc" },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    slots,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};


/**
 * Create TimeSlot(s) for a given date and list of peakSlots.
 * @param {Object} data - { date: 'YYYY-MM-DD', peakSlots: [{ start: 'HH:mm', end: 'HH:mm' }, ...], createdBy: string }
 * @returns {Promise<Array>} - Created TimeSlot records
 */
export const createTimeSlot = async (data) => {
  const { date, peakSlots, createdBy } = data;
  if (!date || !peakSlots || !Array.isArray(peakSlots) || peakSlots.length === 0) {
    throw new Error('Date and peakSlots are required');
  }
  if (!createdBy) {
    throw new Error('createdBy is required');
  }

  try {
    const { start: istDateStartUtc } = getUtcRangeForIstDate(date);
    const createdSlots = [];

    for (const slot of peakSlots) {
      if (!slot.start || !slot.end) {
        throw new Error('Each peakSlot must have start and end');
      }

      const startDateTime = getUtcDateTimeForIstDateAndTime(date, slot.start);
      const endDateTime = getUtcDateTimeForIstDateAndTime(date, slot.end);

      const durationMinutes = Math.round((endDateTime - startDateTime) / (60 * 1000));
      if (durationMinutes <= 0) {
        throw new Error('End time must be after start time for each slot');
      }

      const timeSlot = await prisma.timeSlot.create({
        data: {
          date: istDateStartUtc,
          startTime: startDateTime,
          endTime: endDateTime,
          slotType: 'PEAK',
          durationMinutes,
          createdBy,
        },
      });
      createdSlots.push(timeSlot);
    }
    return createdSlots;
  } catch (err) {
    throw new Error('Failed to create time slots: ' + err.message);
  }
};

/**
 * Update an existing TimeSlot by ID.
 * @param {String} id - TimeSlot ID
 * @param {Object} data - Fields to update (startTime, endTime, date, slotType)
 * @returns {Promise<Object>}
 */
export const updateTimeSlot = async (id, data) => {
  if (!id) throw new Error('id is required for update');
  try {
    const updatePayload = {};

    if (data.date) {
      updatePayload.date = new Date(data.date);
    }
    if (data.startTime) {
      updatePayload.startTime = new Date(data.startTime);
    }
    if (data.endTime) {
      updatePayload.endTime = new Date(data.endTime);
    }
    if (data.slotType) {
      updatePayload.slotType = data.slotType;
    }
    let computedStartTime = updatePayload.startTime || undefined;
    let computedEndTime = updatePayload.endTime || undefined;

    if (!computedStartTime || !computedEndTime) {
      const existingSlot = await prisma.timeSlot.findUnique({ where: { id } });
      if (!existingSlot) throw new Error('TimeSlot not found');
      if (!computedStartTime) computedStartTime = existingSlot.startTime;
      if (!computedEndTime) computedEndTime = existingSlot.endTime;
    }

    const durationMinutes = Math.round((computedEndTime - computedStartTime) / (60 * 1000));
    if (durationMinutes <= 0) {
      throw new Error('End time must be after start time for each slot');
    }
    updatePayload.durationMinutes = durationMinutes;

    const updated = await prisma.timeSlot.update({
      where: { id },
      data: updatePayload,
    });
    return updated;
  } catch (err) {
    throw new Error('Failed to update time slot: ' + err.message);
  }
};

/**
 * Delete an existing TimeSlot by ID.
 * @param {String} id - TimeSlot ID
 * @returns {Promise<Object>}
 */
export const deleteTimeSlot = async (id) => {
  if (!id) throw new Error('TimeSlot id is required');
  try {
    const deleted = await prisma.timeSlot.delete({
      where: { id },
    });
    return deleted;
  } catch (err) {
    throw new Error('Failed to delete time slot: ' + err.message);
  }
};

/**
 * Show/Fetch a single TimeSlot by ID.
 * @param {String} id - TimeSlot ID
 * @returns {Promise<Object>}
 */
export const showTimeSlot = async (id) => {
  if (!id) throw new Error('TimeSlot id is required');
  try {
    const slot = await prisma.timeSlot.findUnique({
      where: { id },
    });
    if (!slot) throw new Error('TimeSlot not found');
    return slot;
  } catch (err) {
    throw new Error('Failed to fetch time slot: ' + err.message);
  }
};

/**
 * Get all TimeSlots with optional filtering and pagination.
 * @param {Object} filter - Filter options { date, createdBy, page, pageSize }
 * @returns {Promise<Object>} - { slots: [], pagination: { total, page, pageSize, totalPages } }
 */
export const getAllTimeSlot = async (filter = {}) => {
  try {
    const {
      date,
      createdBy,
      page = 1,
      pageSize = 20,
    } = filter;

    const where = {};
    if (date) {
      const { start: dayStart, end: dayEnd } = getUtcRangeForIstDate(date);
      where.date = {
        gte: dayStart,
        lte: dayEnd,
      };
    }
    if (createdBy) {
      where.createdBy = createdBy;
    }

    const skip = (page - 1) * pageSize;
    const [total, slots] = await Promise.all([
      prisma.timeSlot.count({ where }),
      prisma.timeSlot.findMany({
        where,
        orderBy: { startTime: 'asc' },
        skip,
        take: pageSize,
      }),
    ]);
    return {
      slots,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    };
  } catch (err) {
    throw new Error('Failed to fetch time slots: ' + err.message);
  }
};



export const getTrainerAllTimeSlot = async (filter = {}) => {
  try {
    const { trainerId, date, day, month, year, page = 1, pageSize = 20 } = filter;

    if (!trainerId) {
      throw new Error("trainerId is required");
    }

    const safePage = Math.max(parseInt(page) || 1, 1);
    const safePageSize = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100);
    const skip = (safePage - 1) * safePageSize;

    // Determine selected reference date for week-based past-session slicing.
    let selectedDateForWeek = new Date();
    if (date) {
      const parsed = new Date(date);
      if (!Number.isNaN(parsed.getTime())) {
        selectedDateForWeek = parsed;
      }
    } else if (day && month && year) {
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const parsed = new Date(y, m - 1, d);
      if (!Number.isNaN(parsed.getTime())) {
        selectedDateForWeek = parsed;
      }
    }

    // Week starts on Sunday (as requested: e.g. 05-04-2026 for selected date 09-04-2026).
    const weekStart = new Date(selectedDateForWeek);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    let dateFilter = null;

    if (date) {
      const { start, end } = getUtcRangeForIstDate(date);
      dateFilter = { gte: start, lte: end };
    } else if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      const dayNum = day ? parseInt(day, 10) : null;

      if (
        Number.isNaN(monthNum) ||
        Number.isNaN(yearNum) ||
        monthNum < 1 ||
        monthNum > 12
      ) {
        throw new Error("Invalid month/year values.");
      }

      if (day && (Number.isNaN(dayNum) || dayNum < 1 || dayNum > 31)) {
        throw new Error("Invalid day value.");
      }

      if (dayNum) {
        const dd = String(dayNum).padStart(2, "0");
        const mm = String(monthNum).padStart(2, "0");
        const { start, end } = getUtcRangeForIstDate(`${yearNum}-${mm}-${dd}`);

        if (
          new Date(yearNum, monthNum - 1, dayNum).getMonth() !== monthNum - 1 ||
          new Date(yearNum, monthNum - 1, dayNum).getDate() !== dayNum
        ) {
          throw new Error("Invalid day for the provided month/year.");
        }

        dateFilter = { gte: start, lte: end };
      } else {
        const { start } = getUtcRangeForIstDate(
          `${yearNum}-${String(monthNum).padStart(2, "0")}-01`
        );
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const { end } = getUtcRangeForIstDate(
          `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
        );
        dateFilter = { gte: start, lte: end };
      }
    } else if (day && (!month || !year)) {
      throw new Error("day filter requires both month and year.");
    }

    const trainerWhere = { trainerId };
    const adminWhere = {};
    if (dateFilter) {
      trainerWhere.date = dateFilter;
      adminWhere.date = dateFilter;
    }

    const [trainerSlots, adminSlots] = await Promise.all([
      prisma.trainerTimeSlot.findMany({
        where: trainerWhere,
        orderBy: { startTime: "asc" },
      }),
      prisma.timeSlot.findMany({
        where: adminWhere,
        orderBy: { startTime: "asc" },
      }),
    ]);

    const trainerSlotByAdminTimeSlotId = new Map();
    trainerSlots.forEach((slot) => {
      if (slot.timeSlotId && !trainerSlotByAdminTimeSlotId.has(slot.timeSlotId)) {
        trainerSlotByAdminTimeSlotId.set(slot.timeSlotId, slot);
      }
    });

    // TrainerTimeSlot records linked to a TimeSlot are admin-derived copies/links.
    // Only standalone TrainerTimeSlot records are trainer-created slots.
    const trainerCreatedSlots = trainerSlots.filter((slot) => !slot.timeSlotId);

    const formattedTrainerSlots = trainerCreatedSlots.map((slot) => ({
      ...slot,
      isBooked: Boolean(slot.isBooked),
      source: "TRAINER",
    }));

    const formattedAdminSlots = adminSlots.map((slot) => ({
      ...slot,
      isBooked: Boolean(trainerSlotByAdminTimeSlotId.get(slot.id)?.isBooked),
      source: "ADMIN",
    }));

    const filteredSlots = [...formattedTrainerSlots, ...formattedAdminSlots].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );

    const slotIds = trainerCreatedSlots.map((slot) => slot.id);
    const bookings = await prisma.trainerBooking.findMany({
      where: {
        timeSlotId: { in: slotIds },
      },
      select: {
        timeSlotId: true,
        bookingStatus: true,
      },
    });

    const bookingMap = new Map();
    bookings.forEach((booking) => bookingMap.set(booking.timeSlotId, booking));

    const now = new Date();
    const upcomingSessions = [];
    const allPastSessions = [];

    for (const slot of filteredSlots) {
      const slotEnd = new Date(slot.endTime);

      if (slot.source === "ADMIN") {
        if (slotEnd >= now) {
          upcomingSessions.push(slot);
        } else {
          allPastSessions.push({
            ...slot,
            isAttended: false,
          });
        }
        continue;
      }

      const booking = bookingMap.get(slot.id);

      if (slotEnd >= now) {
        upcomingSessions.push(slot);
      } else {
        allPastSessions.push({
          ...slot,
          isAttended: booking?.bookingStatus === "ATTENDED",
        });
      }
    }

    const pastSessions = allPastSessions.filter((slot) => {
      const slotStart = new Date(slot.startTime);
      return slotStart >= weekStart && slotStart <= weekEnd;
    });

    return {
      upcomingSessions: upcomingSessions.slice(skip, skip + safePageSize),
      pastSessions: pastSessions.slice(skip, skip + safePageSize),
      pagination: {
        total: filteredSlots.length,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.ceil(filteredSlots.length / safePageSize),
      },
    };
  } catch (err) {
    throw new Error("Failed to fetch trainer time slots: " + err.message);
  }
};
