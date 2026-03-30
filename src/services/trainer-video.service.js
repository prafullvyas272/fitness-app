import { assign } from "nodemailer/lib/shared/index.js";
import prisma from "../utils/prisma.js";

export const createTrainerVideo = async (data) => {
  return await prisma.trainerVideo.create({
    data,
  });
};

export const getTrainerVideo = async (trainerId) => {
  return await prisma.trainerVideo.findMany({
    where: { trainerId },
    orderBy: { createdAt: "desc" },
  });
};

export const assignVideoToClients = async (videoId, clientIds) => {
    const data = clientIds.map((clientId) => ({
        videoId,
        clientId,
    }));

    return await prisma.trainerVideoAssignment.createMany({
        data,
    });
};

export const getVideoForClient = async (clientId) => {
  return await prisma.trainerVideoAssignment.findMany({
    where: { clientId },
    include: {
      video: true,
    },
    orderBy: {
      assignedAt: "desc",
    },
  });
};