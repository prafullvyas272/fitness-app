import { uploadProgressPhoto, getProgressPhotos } from "../services/progress-photo.service.js";

export const uploadProgressPhotoHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, takenAt } = req.body;
    const photoFile = req.file || null;

    const progressPhoto = await uploadProgressPhoto({ userId, type, photoFile, takenAt });

    res.status(201).json({
      success: true,
      message: "Progress photo uploaded successfully.",
      data: progressPhoto,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProgressPhotosHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getProgressPhotos(userId);

    res.status(200).json({
      success: true,
      message: "Progress photos fetched successfully.",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
