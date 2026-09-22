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

export const unassignVideoFromClients = async (trainerId, videoId, clientIds) => {
  try {
    // Verify video belongs to trainer
    const video = await prisma.trainerVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new Error("Video not found");
    }

    if (video.trainerId !== trainerId) {
      throw new Error("Unauthorized to unassign this video");
    }

    // Delete assignments for specified clients
    const result = await prisma.trainerVideoAssignment.deleteMany({
      where: {
        videoId,
        clientId: { in: clientIds },
      },
    });

    return {
      success: true,
      videoId,
      unassignedFromCount: result.count,
      unassignedFromClients: clientIds,
    };
  } catch (err) {
    throw new Error(`Failed to unassign video: ${err.message}`);
  }
};

export const unassignVideoFromAllClients = async (trainerId, videoId) => {
  try {
    // Verify video belongs to trainer
    const video = await prisma.trainerVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new Error("Video not found");
    }

    if (video.trainerId !== trainerId) {
      throw new Error("Unauthorized to unassign this video");
    }

    // Delete all assignments for this video
    const result = await prisma.trainerVideoAssignment.deleteMany({
      where: { videoId },
    });

    return {
      success: true,
      videoId,
      unassignedFromCount: result.count,
      message: `Video unassigned from ${result.count} customer(s)`,
    };
  } catch (err) {
    throw new Error(`Failed to unassign video: ${err.message}`);
  }
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

export const getAssignedVideosForCustomer = async (trainerId, customerId) => {
  try {
    const assignments = await prisma.trainerVideoAssignment.findMany({
      where: {
        clientId: customerId,
        video: { trainerId },
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            videoLink: true,
            thumbnail: true,
            trainerId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    return assignments.map((assignment) => ({
      ...assignment.video,
      assignedAt: assignment.assignedAt,
      assignedToClientId: customerId,
      isAssigned: true,
    }));
  } catch (err) {
    throw new Error(`Failed to fetch assigned videos: ${err.message}`);
  }
};

export const getUnassignedVideos = async (trainerId, customerId = null, page = 1, pageSize = 10) => {
  const skip = (page - 1) * pageSize;

  try {
    // Get all trainer videos
    const trainerVideos = await prisma.trainerVideo.findMany({
      where: { trainerId },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        videoLink: true,
        thumbnail: true,
        trainerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get assigned videos based on scope
    let assignedIds = new Set();

    if (customerId) {
      // Get videos already assigned to this specific customer
      const customerAssignedVideoIds = await prisma.trainerVideoAssignment.findMany({
        where: {
          video: { trainerId },
          clientId: customerId,
        },
        select: { videoId: true },
      });
      assignedIds = new Set(customerAssignedVideoIds.map((a) => a.videoId));
    } else {
      // Get all assigned videos for this trainer
      const allAssignedVideoIds = await prisma.trainerVideoAssignment.findMany({
        where: {
          video: { trainerId },
        },
        select: { videoId: true },
      });
      assignedIds = new Set(allAssignedVideoIds.map((a) => a.videoId));
    }

    // Filter unassigned videos
    const unassignedVideos = trainerVideos.filter((video) => !assignedIds.has(video.id));

    const total = unassignedVideos.length;
    const paginatedVideos = unassignedVideos.slice(skip, skip + pageSize);

    const formattedVideos = paginatedVideos.map((video) => ({
      ...video,
      isAssigned: false,
      availableForCustomerId: customerId || null,
    }));

    return {
      videos: formattedVideos,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      filterInfo: {
        customerId: customerId || null,
        filterType: customerId ? "unassigned-for-customer" : "all-unassigned",
      },
    };
  } catch (err) {
    throw new Error(`Failed to fetch unassigned videos: ${err.message}`);
  }
};

export const getAllTrainerVideosWithAssignmentStatus = async (trainerId, page = 1, pageSize = 10) => {
  const skip = (page - 1) * pageSize;

  try {
    const [trainerVideos, assignments, total] = await Promise.all([
      prisma.trainerVideo.findMany({
        where: { trainerId },
        select: {
          id: true,
          title: true,
          description: true,
          tags: true,
          videoLink: true,
          thumbnail: true,
          trainerId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.trainerVideoAssignment.findMany({
        where: { video: { trainerId } },
        select: {
          videoId: true,
          clientId: true,
          assignedAt: true,
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.trainerVideo.count({ where: { trainerId } }),
    ]);

    // Create a map of video -> assignments
    const assignmentMap = new Map();
    assignments.forEach((assignment) => {
      if (!assignmentMap.has(assignment.videoId)) {
        assignmentMap.set(assignment.videoId, []);
      }
      assignmentMap.get(assignment.videoId).push({
        clientId: assignment.clientId,
        firstName: assignment.client.firstName,
        lastName: assignment.client.lastName,
        email: assignment.client.email,
        assignedAt: assignment.assignedAt,
      });
    });

    const formattedVideos = trainerVideos.map((video) => ({
      ...video,
      isAssigned: assignmentMap.has(video.id),
      assignedTo: assignmentMap.get(video.id) || [],
    }));

    return {
      videos: formattedVideos,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (err) {
    throw new Error(`Failed to fetch videos: ${err.message}`);
  }
};

export const getTrainerAndAdminVideos = async (trainerId, page = 1, pageSize = 10) => {
  const skip = (page - 1) * pageSize;

  const [trainerVideos, adminVideos, totalTrainer, totalAdmin] = await Promise.all([
    prisma.trainerVideo.findMany({
      where: { trainerId },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        type: true,
        videoLink: true,
        thumbnail: true,
        trainerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.workoutTrainerAssignment.findMany({
      where: { trainerId },
      include: {
        workout: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            videoUrl: true,
            thumbnailUrl: true,
            status: true,
            uploadedBy: true,
            createdAt: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.trainerVideo.count({ where: { trainerId } }),
    prisma.workoutTrainerAssignment.count({ where: { trainerId } }),
  ]);

  const formattedTrainerVideos = trainerVideos.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    tags: video.tags,
    type: video.type,
    videoLink: video.videoLink,
    thumbnail: video.thumbnail,
    trainerId: video.trainerId,
    createdAt: video.createdAt,
    source: "TRAINER",
  }));

  const formattedAdminVideos = adminVideos.map((assignment) => ({
    id: assignment.workout.id,
    title: assignment.workout.title,
    description: assignment.workout.description,
    tags: assignment.workout.tags,
    videoUrl: assignment.workout.videoUrl,
    thumbnailUrl: assignment.workout.thumbnailUrl,
    status: assignment.workout.status,
    uploadedBy: assignment.workout.uploadedBy,
    createdAt: assignment.workout.createdAt,
    assignedAt: assignment.assignedAt,
    source: "ADMIN",
  }));

  const allVideos = [
    ...formattedTrainerVideos,
    ...formattedAdminVideos,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalRecords = totalTrainer + totalAdmin;

  return {
    videos: allVideos,
    pagination: {
      total: totalRecords,
      page,
      pageSize,
      totalPages: Math.ceil(totalRecords / pageSize),
    },
  };
}; 