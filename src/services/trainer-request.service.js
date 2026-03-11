import prisma from "../utils/prisma.js";

export const getAllTrainerRequests = async () => {
  try {
    const trainerRequests = await prisma.trainerRequest.findMany({
      include: {
        customer: true,
        trainer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return trainerRequests;
  } catch (err) {
    throw new Error("Failed to fetch trainer requests: " + err.message);
  }
};