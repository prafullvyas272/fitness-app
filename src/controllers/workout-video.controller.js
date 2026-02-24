import { createWorkoutVideo, updateWorkoutVideo, deleteWorkoutVideo, getAllWorkOutVideos, getWorkoutVideobyId, getAllWorkoutVideoTags } from "../services/workout-video.service.js";

export const uploadWorkoutVideoHandler = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!req.file) {
      throw new Error("Video file is required");
    }
    console.log(tags)

    let parsedTags = [];

    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === "string") {
        parsedTags = tags.split(",").map(item => item.trim())
      } else {
        throw new Error("Tags must be an array of strings2");
      }
    }

    const video = await createWorkoutVideo({
      title,
      description,
      tags: parsedTags,
      filePath: req.file.buffer,
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


export const updateWorkoutVideoHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) {
      if (typeof tags === "string") {
        try {
          updateData.tags = JSON.parse(tags);
        } catch (e) {
          updateData.tags = [tags];
        }
      } else {
        updateData.tags = tags;
      }
    }

    const updatedVideo = await updateWorkoutVideo(id, updateData);

    res.status(200).json({
      success: true,
      message: "Workout video updated successfully",
      data: updatedVideo,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


export const getAllWorkoutVideosHandler = async (req, res) => {
  try {
    const videos = await getAllWorkOutVideos();
    res.status(200).json({
      success: true,
      message: "Workout videos fetched successfully",
      data: videos,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getWorkoutVideoByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await getWorkoutVideobyId(id);
    res.status(200).json({
      success: true,
      message: "Workout video fetched successfully",
      data: video,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteWorkoutVideoHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await deleteWorkoutVideo(id);
    res.status(200).json({
      success: true,
      message: "Workout video deleted successfully",
      data: deletedVideo,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllWorkoutVideoTagsHandler = async (req, res) => {
  try {
    const tags = await getAllWorkoutVideoTags();
    res.status(200).json({
      success: true,
      message: "Workout video tags fetched successfully",
      data: tags,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};