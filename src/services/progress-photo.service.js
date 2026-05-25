import prisma from "../utils/prisma.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const VALID_TYPES = ["BEFORE", "DURING", "AFTER", "CHECK_IN"];

export const uploadProgressPhoto = async ({ userId, type, photoFile, takenAt }) => {
  if (!userId) throw new Error("User ID is required");
  if (!type) throw new Error("Photo type is required");
  if (!VALID_TYPES.includes(type.toUpperCase())) {
    throw new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`);
  }
  if (!photoFile) throw new Error("Photo file is required");

  const uploadResult = await uploadToCloudinary(photoFile.buffer, "progress-photos");

  const parsedDate = takenAt ? new Date(takenAt) : new Date();
  if (isNaN(parsedDate.getTime())) throw new Error("Invalid takenAt date");

  const progressPhoto = await prisma.progressPhoto.create({
    data: {
      userId,
      type: type.toUpperCase(),
      photoUrl: uploadResult.secure_url,
      photoPublicId: uploadResult.public_id,
      takenAt: parsedDate,
    },
  });

  return progressPhoto;
};

export const getProgressPhotos = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  const photos = await prisma.progressPhoto.findMany({
    where: { userId },
    orderBy: { takenAt: "asc" },
    select: {
      id: true,
      type: true,
      photoUrl: true,
      takenAt: true,
      createdAt: true,
    },
  });

  // Group by type for easy consumption on the frontend
  const grouped = {
    BEFORE: [],
    DURING: [],
    AFTER: [],
    CHECK_IN: [],
  };

  for (const photo of photos) {
    grouped[photo.type].push(photo);
  }

  return { photos, grouped };
};
