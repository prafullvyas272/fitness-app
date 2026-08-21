import { assign } from "nodemailer/lib/shared/index.js";
import prisma from "../utils/prisma.js";
import { email } from "zod";

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

export const getAllTrainerVideos = async () => {
  return await prisma.trainerVideo.findMany({
    include: {
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc"
    },
  });
};

export const updateTrainerVideo = async (videoId, trainerId, data) => {
  const video = await prisma.trainerVideo.findUnique({
    where: { id: videoId },
  });

  if (!video) throw new Error("Video not found");
  if (video.trainerId !== trainerId) throw new Error("Unauthorized to update this video");

  const { title, description, tags, videoLink, type } = data;
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (tags !== undefined) updateData.tags = tags;
  if (videoLink !== undefined) updateData.videoLink = videoLink;
  if (type !== undefined) updateData.type = type;

  return await prisma.trainerVideo.update({
    where: { id: videoId },
    data: updateData,
  });
};

export const deleteTrainerVideo = async (videoId, trainerId) => {
  const video = await prisma.trainerVideo.findUnique({
    where: { id: videoId },
  });

  if (!video) throw new Error("Video not found");
  if (video.trainerId !== trainerId) throw new Error("Unauthorized to delete this video");

  await prisma.$transaction(async (tx) => {
    await tx.trainerVideoAssignment.deleteMany({
      where: { videoId },
    });
    await tx.trainerVideo.delete({
      where: { id: videoId },
    });
  });

  return { success: true, message: "Video deleted successfully" };
}; 