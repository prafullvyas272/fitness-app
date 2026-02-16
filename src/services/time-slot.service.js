import prisma from "../utils/prisma.js";

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
  let startOfDay, endOfDay;
  try {
    startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  } catch {
    throw new Error("Invalid date format");
  }
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
    const dateOnly = new Date(date);
    const createdSlots = [];

    for (const slot of peakSlots) {
      if (!slot.start || !slot.end) {
        throw new Error('Each peakSlot must have start and end');
      }

      // Combine the date and time strings
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);

      const startDateTime = new Date(dateOnly);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(dateOnly);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const durationMinutes = Math.round((endDateTime - startDateTime) / (60 * 1000));
      if (durationMinutes <= 0) {
        throw new Error('End time must be after start time for each slot');
      }

      const timeSlot = await prisma.timeSlot.create({
        data: {
          date: new Date(dateOnly),
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
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
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

