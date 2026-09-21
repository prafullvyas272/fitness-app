import {
  createTrainerVideo,
  getTrainerVideo,
  assignVideoToClients,
  getVideoForClient,
  getAllTrainerVideos,
  updateTrainerVideo,
  deleteTrainerVideo,
  getTrainerAndAdminVideos
} from "../services/trainer-video.service.js";
import { getYoutubeThumbnail } from "../utils/youtube.js";

export const addTrainerVideoHandler = async (req, res) => {
  try {
    const { title, description, tags, videoLink } = req.body;
    const videoFile = req.file;

    // Validate: either file or link must be provided
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!videoFile && !videoLink) {
      return res.status(400).json({
        success: false,
        message: "Provide either video file or videoLink",
      });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) parsedTags = tags;
      else parsedTags = tags.split(",").map((t) => t.trim());
    }

    let thumbnail = null;
    let videoUrl = null;
    let videoType = "VIDEO"; // File upload type

    if (videoFile) {
      // Handle file upload to Cloudinary
      const { uploadVideoToCloudinary } = await import("../utils/uploadToCloudinary.js");
      try {
        const uploadResult = await uploadVideoToCloudinary(videoFile.buffer, "trainer-videos");
        videoUrl = uploadResult.secure_url;
        // Use eager thumbnail if generated, otherwise use video URL
        thumbnail = uploadResult.eager && uploadResult.eager[0] ? uploadResult.eager[0].secure_url : uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(400).json({
          success: false,
          message: "Failed to upload video to cloud storage",
          error: uploadErr.message,
        });
      }
    } else if (videoLink) {
      // Handle video link
      videoUrl = videoLink;
      videoType = "LINK";
      thumbnail = getYoutubeThumbnail(videoLink);
    }

    const video = await createTrainerVideo({
      title,
      description,
      tags: parsedTags,
      type: videoType,
      videoLink: videoUrl,
      thumbnail,
      trainerId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: video,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to add video",
      error: err.message,
    });
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

export const updateTrainerVideoHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, tags, videoLink, type } = req.body;
    const trainerId = req.user.userId;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

    const video = await updateTrainerVideo(videoId, trainerId, {
      title,
      description,
      tags,
      videoLink,
      type,
    });

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: video,
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }
    if (err.message === "Video not found") {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update video",
    });
  }
};

export const deleteTrainerVideoHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const trainerId = req.user.userId;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

    await deleteTrainerVideo(videoId, trainerId);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }
    if (err.message === "Video not found") {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
    });
  }
};

export const getTrainerAndAdminVideosHandler = async (req, res) => {
  try {
    const trainerId = req.user.userId;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await getTrainerAndAdminVideos(trainerId, page, pageSize);

    res.status(200).json({
      success: true,
      message: "Trainer and admin videos fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
