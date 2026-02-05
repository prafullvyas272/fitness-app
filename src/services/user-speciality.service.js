import prisma from "../utils/prisma.js";


export const setUserSpecialities = async (userId, specialityIds) => {
  const uniqueIds = [...new Set(specialityIds)];

  await prisma.userSpeciality.deleteMany({
    where: { userId },
  });

  await prisma.userSpeciality.createMany({
    data: uniqueIds.map((id) => ({
      userId,
      specialityId: id,
    })),
  });

  return true;
};

/**
 * Get user's specialities
 */
export const getUserSpecialities = async (userId) => {
  const records = await prisma.userSpeciality.findMany({
    where: { userId },
    select: {
      specialityId: true,
    },
  });

  return records.map((r) => r.specialityId);
};
