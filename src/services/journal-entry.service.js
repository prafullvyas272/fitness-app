import prisma from "../utils/prisma.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

/**
 * Adds a journal entry for a user for a specific date.
 * If an entry for that userId and date already exists, it will update it.
 * Otherwise, it creates a new entry.
 *
 * The frontend sends "image" and "video" (file data or base64/string), which are uploaded to Cloudinary.
 * The Cloudinary URLs are stored as photoUrl and videoUrl in the DB.
 *
 * @param {Object} params - Journal entry parameters.
 * @param {string} params.userId - User's ID.
 * @param {string|Date} params.date - ISO string date (YYYY-MM-DD or Date object/string).
 * @param {any} [params.image] - Image file or base64 string (to upload to Cloudinary).
 * @param {any} [params.video] - Video file or base64 string (to upload to Cloudinary).
 * @param {string} [params.note]
 * @param {boolean} [params.isPrivate]
 * @param {number} [params.energy]
 * @param {number} [params.physicalReadiness]
 * @param {number} [params.motivation]
 * @param {number} [params.stressLevel]
 * @param {number} [params.mentalFitness]
 *
 * @returns {Promise<Object>} The upserted journal entry.
 */

export const addJournalEntryForDate = async ({
  userId,
  date,
  image,
  video,
  note,
  isPrivate = false,
  energy,
  physicalReadiness,
  motivation,
  stressLevel,
  mentalFitness
}) => {
  if (!userId) throw new Error("User ID is required");
  if (!date) throw new Error("Date is required");

  let parsedDate;
  try {
    parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) throw new Error();
  } catch {
    throw new Error("Invalid date provided");
  }
  // Normalize to start of day (ignore time for upsert)
  const dayStart = new Date(parsedDate.setHours(0, 0, 0, 0));

  // Upload image/video to cloudinary if present and get URLs
  let photoUrl = undefined;
  let videoUrl = undefined;
  try {
    if (image) {
      const imageRes = await uploadToCloudinary(image.buffer, "journal-images");
      photoUrl = imageRes.url;
    }
    if (video) {
      const videoRes = await uploadToCloudinary(video.buffer, "journal-videos", "video");
      videoUrl = videoRes.url;
    }
  } catch (err) {
    throw new Error("Failed to upload media to Cloudinary: " + err.message);
  }

  try {
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        userId,
        date: {
          gte: dayStart,
          lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) // Next day
        }
      }
    });

    if (existingEntry) {
      // Update existing: keep old photoUrl/videoUrl if not provided new
      return await prisma.journalEntry.update({
        where: { id: existingEntry.id },
        data: {
          photoUrl: typeof photoUrl === "undefined" ? existingEntry.photoUrl : photoUrl,
          videoUrl: typeof videoUrl === "undefined" ? existingEntry.videoUrl : videoUrl,
          note,
          date: dayStart,
          isPrivate,
          energy,
          physicalReadiness,
          motivation,
          stressLevel,
          mentalFitness
        }
      });
    } else {
      // Create new
      return await prisma.journalEntry.create({
        data: {
          userId,
          photoUrl,
          videoUrl,
          note,
          date: dayStart,
          isPrivate,
          energy,
          physicalReadiness,
          motivation,
          stressLevel,
          mentalFitness
        }
      });
    }
  } catch (err) {
    throw new Error("Failed to add or update journal entry: " + err.message);
  }
};

/**
 * Retrieve a journal entry for a user for a specific date.
 *
 * @param {string} userId - User's ID.
 * @param {string|Date} date - The date to fetch (YYYY-MM-DD or Date).
 *
 * @returns {Promise<Object|null>} The journal entry or null if not found.
 */
export const getJournalEntryByDate = async (userId, date) => {
  if (!userId) throw new Error("User ID is required");

  // If no date is provided, return all journal entries for this user
  if (!date) {
    try {
      const entries = await prisma.journalEntry.findMany({
        where: { userId },
        orderBy: {
            date: "desc"
        }
      });

      // Attach dayNumber to each entry. Highest dayNumber for most recent.
      const total = entries.length;
      const entriesWithDayNumber = entries.map((entry, idx) => ({
        ...entry,
        dayNumber: total - idx
      }));

      return entriesWithDayNumber;
    } catch (err) {
      throw new Error("Failed to fetch journal entries: " + err.message);
    }
  }

  let parsedDate;
  try {
    parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) throw new Error();
  } catch {
    throw new Error("Invalid date provided");
  }
  // Normalize to start of day
  const dayStart = new Date(parsedDate.setHours(0, 0, 0, 0));
  const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  try {
    // Fetch the earliest journal entry for the user on the specific day
    const entry = await prisma.journalEntry.findFirst({
      where: {
        userId,
        date: {
          gte: dayStart,
          lt: nextDay
        }
      },
      orderBy: {
        date: "desc"
      }
    });

    console.log(entry)
    return entry;
  } catch (err) {
    throw new Error("Failed to fetch journal entry: " + err.message);
  }
};