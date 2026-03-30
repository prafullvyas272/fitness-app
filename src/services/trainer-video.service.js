import prisma from "../utils/prisma.js";

export const createTrainerVideo = async (data) => {
  return await prisma.trainerVideo.create({
    data,
  });
};

export const getVideosForClient = async (clientId) => {
  return await prisma.trainerVideo.findMany({
    where: {
      clientIds: {
        has: clientId, // 🔥 IMPORTANT
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};