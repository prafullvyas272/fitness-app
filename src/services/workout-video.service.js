import prisma from "../utils/prisma.js";
import { videoQueue } from "../queues/video.queue.js";
import { VIDEO_UPLOAD_STATUS } from "../constants/constants.js";

export const createWorkoutVideo = async ({
  title,
  description,
  tags,
  filePath,
  uploadedBy,
}) => {
  try {
    const video = await prisma.workoutVideo.create({
      data: {
        title,
        description,
        tags,
        uploadedBy,
        status: VIDEO_UPLOAD_STATUS.PROCESSING,
      },
    });

    await videoQueue.add(
      "video-upload",
      {
        videoId: video.id,
        filePath,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log(`Video queued: ${video.id}`);

    return video;
  } catch (err) {
    console.error("Error in createWorkoutVideo:", err);
    throw new Error("Failed to create workout video");
  }
};


export const getAllWorkOutVideos = async () => {
  try {
    const videos = await prisma.workoutVideo.findMany();
    return videos;
  } catch (err) {
    console.error("Error in getAllWorkOutVideos:", err);
    throw new Error("Failed to fetch workout videos");
  }
};

export const getWorkoutVideobyId = async (id) => {
  try {
    const video = await prisma.workoutVideo.findUnique({
      where: { id },
    });
    if (!video) {
      throw new Error("Workout video not found");
    }
    return video;
  } catch (err) {
    console.error("Error in getWorkoutVideobyId:", err);
    throw new Error(err.message || "Failed to fetch workout video");
  }
};

export const updateWorkoutVideo = async (id, updateData) => {
  try {
    const updatedVideo = await prisma.workoutVideo.update({
      where: { id },
      data: updateData,
    });
    return updatedVideo;
  } catch (err) {
    console.error("Error in updateWorkoutVideo:", err);
    if (
      err.code === "P2025" ||
      err.message?.toLowerCase().includes("record to update not found")
    ) {
      throw new Error("Workout video not found");
    }
    throw new Error("Failed to update workout video");
  }
};

export const deleteWorkoutVideo = async (id) => {
  try {
    const deletedVideo = await prisma.workoutVideo.delete({
      where: { id },
    });
    return deletedVideo;
  } catch (err) {
    console.error("Error in deleteWorkoutVideo:", err);
    if (
      err.code === "P2025" ||
      err.message?.toLowerCase().includes("record to delete does not exist")
    ) {
      throw new Error("Workout video not found");
    }
    throw new Error("Failed to delete workout video");
  }
};


export const getAllWorkoutVideoTags = async () => {
  try {
    const tags = await prisma.workoutVideo.findMany({
      select: {
        tags: true,
      },
    });

    const allTags = Array.from(
      new Set(
        tags.flatMap(video => Array.isArray(video.tags) ? video.tags : [])
      )
    );

    return allTags;
  } catch (err) {
    console.error("Error in getAllWorkoutVideoTags:", err);
    throw new Error("Failed to fetch workout video tags");
  }
};