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