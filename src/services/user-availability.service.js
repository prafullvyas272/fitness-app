import prisma from "../utils/prisma.js";


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
