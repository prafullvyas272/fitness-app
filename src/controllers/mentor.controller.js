import { createMentor, getAllMentors, getMentorById, updateMentor, deleteMentor } from "../services/mentor.service.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const createMentorHandler = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "mentor_avatars");
      data.avatarUrl = result.secure_url;
      data.avatarPublicId = result.public_id;
    }

    if (data.specialityIds && typeof data.specialityIds === "string") {
      data.specialityIds = JSON.parse(data.specialityIds);
    }

    const mentor = await createMentor(data);

    res.status(201).json({
      success: true,
      message: "Mentor created successfully",
      data: mentor,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllMentorsHandler = async (req, res) => {
  try {
    const { page, pageSize, status } = req.query;
    const data = await getAllMentors({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      status,
    });
    res.status(200).json({ success: true, message: "Mentors fetched successfully", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMentorByIdHandler = async (req, res) => {
  try {
    const data = await getMentorById(req.params.id);
    res.status(200).json({ success: true, message: "Mentor fetched successfully", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateMentorHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "mentor_avatars");
      data.avatarUrl = result.secure_url;
      data.avatarPublicId = result.public_id;
    }

    if (data.specialityIds && typeof data.specialityIds === "string") {
      data.specialityIds = JSON.parse(data.specialityIds);
    }

    const mentor = await updateMentor(id, data);
    res.status(200).json({ success: true, message: "Mentor updated successfully", data: mentor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteMentorHandler = async (req, res) => {
  try {
    await deleteMentor(req.params.id);
    res.status(200).json({ success: true, message: "Mentor deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
