import { createTrainerVideo, getVideosForClient } from "../services/trainer-video.service.js";
import { getYoutubeThumbnail } from "../utils/youtube.js";

export const addTrainerVideoHandler = async (req, res) => {
  try {
    const { title, description, tags, videoLink, clientIds } = req.body;

    if (!title || !videoLink || !clientIds) {
      return res.status(400).json({
        message: "Title, videoLink and clientIds are required",
      });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) parsedTags = tags;
      else parsedTags = tags.split(",").map((t) => t.trim());
    }

    // 🔥 Generate thumbnail
    const thumbnail = getYoutubeThumbnail(videoLink);

    const video = await createTrainerVideo({
      title,
      description,
      tags: parsedTags,
      videoLink,
      thumbnail,
      clientIds,
      trainerId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add video" });
  }
};


export const getClientVideosHandler = async (req, res) => {
  try {
    const clientId = req.user.userId;

    const videos = await getVideosForClient(clientId);

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch videos",
    });
  }
};