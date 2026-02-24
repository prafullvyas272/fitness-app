import { Worker } from "bullmq";
import Redis from "ioredis";
import prisma from "../utils/prisma.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { VIDEO_UPLOAD_STATUS } from "../constants/constants.js";

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

const uploadToCloudinary = async (filePath) => {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "workouts",
  });
};

new Worker(
  "video-upload",
  async (job) => {
    const { videoId, filePath } = job.data;
    console.log("JOB DATA:", job.data);

    try {
      console.log("Processing video:", videoId);

      const result = await uploadToCloudinary(filePath);
      console.log(filePath)

      await prisma.workoutVideo.update({
        where: { id: videoId },
        data: {
          videoUrl: result.secure_url,
          publicId: result.public_id,
          status: VIDEO_UPLOAD_STATUS.READY,
        },
      });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      console.log("Video processed:", videoId);
    } catch (err) {
      console.error("Worker error:", err);

      await prisma.workoutVideo.update({
        where: { id: videoId },
        data: { status: VIDEO_UPLOAD_STATUS.FAILED },
      });

      throw err;
    }
  },
  {
    connection,
    concurrency: 2,
  }
);