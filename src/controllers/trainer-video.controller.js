import { 
  createTrainerVideo, 
  getTrainerVideo,
  assignVideoToClients,
  getVideoForClient,
  getAllTrainerVideos 
} from "../services/trainer-video.service.js";
import { getYoutubeThumbnail } from "../utils/youtube.js";

export const addTrainerVideoHandler = async (req, res) => {
  try {
    const { title, description, tags, videoLink, type } = req.body;
    const normalizedType = String(type || "link").trim().toUpperCase();
    const allowedTypes = ["LINK", "VIDEO"];

    if (!title || !videoLink) {
      return res.status(400).json({
        message: "Title and videoLink are required",
      });
    }

    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({
        message: "type must be either 'link' or 'video'",
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
      type: normalizedType,
      videoLink,
      thumbnail,
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


export const getTrainerVideosHandler = async (req, res) => {
  try {
    console.log("USER:", req.user); // 👈 ADD THIS

    const trainerId = req.user.userId;

    const videos = await getTrainerVideo(trainerId);

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (err) {
    console.error("ERROR:", err); // 👈 ADD THIS
    res.status(500).json({
      message: "Failed to fetch videos",
    });
  }
};

export const assignVideoHandler = async (req, res) => {
    try {
        const { videoId, clientIds } = req.body;

        if (!videoId || !clientIds || !clientIds.length === 0) {
            return res.status(400).json({
                message: "videoId and clientIds are required",
            });
        }
        await assignVideoToClients(videoId, clientIds);

        res.status(200).json({  
            success: true,
            message: "Video assigned to clients successfully",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to assign video",
        });
    }
};

export const getClientVideosHandler = async (req, res) => {
  try {
    const clientId = req.user.userId;

    const data = await getVideoForClient(clientId);

    const videos = data.map((item) => item.video);
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

export const getAllTrainerVideosHandler = async (req, res) => {
  try {
    const videos = await getAllTrainerVideos();

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
