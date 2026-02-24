import prisma from "../utils/prisma.js";
import { videoQueue } from "../queues/video.queue.js";
import { VIDEO_UPLOAD_STATUS } from "../constants/constants.js";

export const createWorkoutVideo = async ({
  title,
  description,
  tags,
  fileBuffer,
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

    await videoQueue.add("upload", {
      videoId: video.id,
      fileBuffer,
    });

    console.log(
      `Workout video created and upload job queued. Video ID: ${video.id}`
    );

    return video;
  } catch (err) {
    console.error("Error in createWorkoutVideo:", err);
    throw new Error("Failed to create workout video");
  }
};