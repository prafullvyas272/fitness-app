import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer, folder = "avatars") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Upload video to Cloudinary
 * @param {Buffer} fileBuffer - Video file buffer
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<object>} - Upload result with secure_url, public_id, etc.
 */
export const uploadVideoToCloudinary = (fileBuffer, folder = "trainer-videos") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
        eager: [
          { width: 300, height: 300, crop: "fill", format: "jpg" } // Generate thumbnail
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * @param {string} avatarPublicId - The public ID of the image in Cloudinary.
 * @returns {Promise<object>} - The result of the deletion from Cloudinary.
 */
export const deleteFromCloudinaryByPublicId = (avatarPublicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      avatarPublicId,
      { resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};
