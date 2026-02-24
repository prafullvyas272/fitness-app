import { createWorkoutVideo } from "../services/workout-video.service.js";

export const uploadWorkoutVideoHandler = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!req.file) {
      throw new Error("Video file is required");
    }

    const parsedTags = tags ? JSON.parse(tags) : [];

    const video = await createWorkoutVideo({
      title,
      description,
      tags: parsedTags,
      filePath: req.file.path,
      uploadedBy: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "Video upload started",
      data: video,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};