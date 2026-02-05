import prisma from "../utils/prisma.js";
import { getWeekStartAndEndDates, getMonthStartAndEndDates } from "../utils/date.ts";

/**
 * Get user's daily availability
 */
export const getUserAvailabilityDataByDate = async (userId, date) => {
    // Find the daily availability for the specified user and date
    const dailyAvailability = await prisma.trainerDailyAvailability.findFirst({
        where: {
            trainerId: userId,
            date: new Date(date),
        },
        include: {
            trainerWeek: true,
            timeSlots: true,
        },
    });

    if (!dailyAvailability) {
        return null;
    }

    // Get requiredMinutes and totalBookedMinutes from the associated week
    const requiredMinutes = dailyAvailability.trainerWeek ? dailyAvailability.trainerWeek.requiredMinutes : 0;
    const totalBookedMinutes = dailyAvailability.trainerWeek ? dailyAvailability.trainerWeek.totalBookedMinutes : 0;

    const isAvailable = dailyAvailability.isAvailable;

    const peakSlots = [];
    const alternativeSlots = [];

    for (const slot of dailyAvailability.timeSlots) {
        const start = slot.startTime.toISOString().substr(11, 5);
        const end = slot.endTime.toISOString().substr(11, 5);

        if (slot.slotType === "PEAK") {
            peakSlots.push({ start, end });
        } else if (slot.slotType === "ALTERNATIVE") {
            alternativeSlots.push({ start, end });
        }
    }

    return {
        requiredMinutes,
        totalBookedMinutes,
        isAvailable,
        peakSlots,
        alternativeSlots,
    };
};


/**
 * Stores a user's daily availability and its time slots
 * @param {string} userId - The trainer's user id (string/ObjectId)
 * @param {object} availability - Object with fields: date (YYYY-MM-DD), isAvailable (bool), peakSlots ([{start,end}]), alternativeSlots ([{start,end}])
 * @returns {Promise<object>} The created or updated daily availability doc
 */
export const setUserAvailabilityForDate = async (userId, availability) => {
    // Helper: Parse input date as start of day in UTC (avoid timezone bug)
    const makeDateAt = (dateStr, timeStr) => {
        // dateStr: "2026-01-29", timeStr: "10:30"
        const [hours, minutes] = timeStr.split(":").map(Number);
        let d = new Date(dateStr);
        d.setHours(hours, minutes, 0, 0);
        return d;
    };

    const { date, isAvailable, peakSlots = [], alternativeSlots = [] } = availability;

    const { weekStartDate, weekEndDate } = getWeekStartAndEndDates(date);

    // 2. Upsert the "week" document (TrainerWeeklyAvailability)
    let weekDoc = await findOrCreateWeeklyData(userId, weekStartDate, weekEndDate);

    // 3. Upsert the daily availability for this date+user
    let dailyDoc = await updateOrCreateDailyData(userId, date, weekDoc.id, isAvailable);

    await deleteExistinTimeSlots(dailyDoc.id);

    // 5. Add new slots and calculate totalDayMinutes for the day
    const slots = [];

    for (const slot of peakSlots) {
        const startTime = makeDateAt(date, slot.start);
        const endTime = makeDateAt(date, slot.end);
        const durationMinutes = Math.round((endTime - startTime) / 60000);
        slots.push({
            dailyAvailabilityId: dailyDoc.id,
            trainerId: userId,
            date: new Date(date),
            startTime,
            endTime,
            slotType: "PEAK",
            durationMinutes,
            isBooked: false,
        });
    }

    for (const slot of alternativeSlots) {
        const startTime = makeDateAt(date, slot.start);
        const endTime = makeDateAt(date, slot.end);
        const durationMinutes = Math.round((endTime - startTime) / 60000);
        slots.push({
            dailyAvailabilityId: dailyDoc.id,
            trainerId: userId,
            date: new Date(date),
            startTime,
            endTime,
            slotType: "ALTERNATIVE",
            durationMinutes,
            isBooked: false,
        });
    }

    if (slots.length > 0) {
        await prisma.trainerTimeSlot.createMany({
            data: slots,
        });
    }

    // 6. Update totalDayMinutes field in dailyDoc with sum of slot durations
    const totalDayMinutes = slots.reduce((sum, slot) => sum + slot.durationMinutes, 0);

    dailyDoc = await prisma.trainerDailyAvailability.update({
        where: { id: dailyDoc.id },
        data: { totalDayMinutes }
    });

    // Update weekly data for totalBookedMinutes
    await prisma.trainerWeeklyAvailability.update({
        where: { id: weekDoc.id },
        data: {
            totalBookedMinutes: {
                increment: totalDayMinutes
            }
        }
    });

    // 7. Return saved daily availability (include time slots)
    const trainerDailyAvailabilityData = await prisma.trainerDailyAvailability.findUnique({
        where: { id: dailyDoc.id },
        include: {
            timeSlots: true,
            trainerWeek: true,
        }
    });

    return trainerDailyAvailabilityData;
};


/**
 * Method to find or create weekly data for user
 * @param {*} userId 
 * @param {*} weekStartDate 
 * @param {*} weekEndDate 
 */
const findOrCreateWeeklyData = async (userId, weekStartDate, weekEndDate) => {
    let weekDoc = await prisma.trainerWeeklyAvailability.findFirst({
        where: {
            trainerId: userId,
            weekStartDate: weekStartDate,
            weekEndDate: weekEndDate,
        },
    });

    if (!weekDoc) {
        weekDoc = await prisma.trainerWeeklyAvailability.create({
            data: {
                trainerId: userId,
                weekStartDate,
                weekEndDate,
                // TODO: maybe in the future we need to calculate requiredMinutes based on the user creation date formula eg 45/6 
            },
        });
    }

    return weekDoc;
}


/**
 * Updates an existing daily availability or creates a new one if it doesn't exist.
 * @param {Object} params - The parameters
 * @param {string} params.userId - Trainer user id
 * @param {Date|string} params.date - The date of the daily availability
 * @param {string} params.trainerWeekId - The ID of the corresponding weekly availability document
 * @param {boolean} params.isAvailable - Availability status for the day
 * @returns {Promise<Object>} - The created or updated daily availability document
 */
const updateOrCreateDailyData = async (userId, date, trainerWeekId, isAvailable) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    let dailyDoc = await prisma.trainerDailyAvailability.findFirst({
        where: {
            trainerId: userId,
            date: dateObj,
        },
    });

    if (!dailyDoc) {
        dailyDoc = await prisma.trainerDailyAvailability.create({
            data: {
                trainerWeekId,
                trainerId: userId,
                date: dateObj,
                dayOfWeek: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
                isAvailable,
                totalDayMinutes: 0,
            },
        });
    } else {
        dailyDoc = await prisma.trainerDailyAvailability.update({
            where: { id: dailyDoc.id },
            data: {
                trainerWeekId,
                isAvailable,
            },
        });
    }
    return dailyDoc;
};


/**
 * Delete existing slots by daily data availability id
 * @param {*} dailyDocId 
 */
const deleteExistinTimeSlots = async (dailyDocId) => {
    await prisma.trainerTimeSlot.deleteMany({
        where: {
            dailyAvailabilityId: dailyDocId,
        },
    });

    return true;
}

export const canTrainerApplyLeave = async (trainerId, date) => {
    const { monthStartDate, monthEndDate } = getMonthStartAndEndDates(date);

    const leaves = await prisma.trainerDailyAvailability.findMany({
        where: {
            trainerId,
            date: {
                gte: monthStartDate,
                lte: monthEndDate,
            },
            isAvailable: false,
        },
    });

    return leaves.length === 0;
};

export const applyLeave = async (trainerId, date) => {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Try to find existing daily doc
    let dailyDoc = await prisma.trainerDailyAvailability.findFirst({
        where: {
            trainerId,
            date: dateObj,
        },
    });

    const { weekStartDate, weekEndDate } = getWeekStartAndEndDates(date);

    const weekDoc = await findOrCreateWeeklyData(
        trainerId,
        weekStartDate,
        weekEndDate
      );
      
    if (dailyDoc) {
        // Update to mark as leave if it isn't already
        if (dailyDoc.isAvailable !== false) {
            dailyDoc = await prisma.trainerDailyAvailability.update({
                where: { id: dailyDoc.id },
                data: {
                    isAvailable: false,
                    totalDayMinutes: 0,
                },
            });
        }
    } else {
        dailyDoc = await prisma.trainerDailyAvailability.create({
            data: {
              date: new Date(date),
              dayOfWeek : dateObj.toLocaleDateString("en-US", { weekday: "long" }),
              isAvailable: false,
              totalDayMinutes: 0,
          
              trainer: {
                connect: { id: trainerId },
              },
          
              trainerWeek: {
                connect: { id: weekDoc.id },
              },
            },
          });
          
          
    }

    return dailyDoc;
};