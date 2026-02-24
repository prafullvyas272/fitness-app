import { Worker } from "bullmq";
import Redis from "ioredis";
import prisma from "../utils/prisma.js";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {},
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "workouts" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};


new Worker(
  "video-upload",
  async (job) => {
    let { videoId, fileBuffer } = job.data;

    try {
      if (fileBuffer?.type === "Buffer") {
        fileBuffer = Buffer.from(fileBuffer.data);
      }

      const result = await uploadToCloudinary(fileBuffer);

      await prisma.workoutVideo.update({
        where: { id: videoId },
        data: {
          videoUrl: result.secure_url,
          publicId: result.public_id,
          status: "ready",
        },
      });
    } catch (err) {
      await prisma.workoutVideo.update({
        where: { id: videoId },
        data: { status: "failed" },
      });

      throw err;
    }
  },
  { connection }
);