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
