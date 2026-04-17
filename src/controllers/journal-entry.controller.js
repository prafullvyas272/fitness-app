import {
  addJournalEntryForDate,
  getJournalEntryByDate,
  getAllJournalEntries,
} from "../services/journal-entry.service.js";

/**
 * Controller to add or update a journal entry for a specific date.
 * Expects userId in req.user.id (set by auth middleware).
 * Accepts fields: image, video, note, isPrivate, energy, physicalReadiness, motivation, stressLevel, mentalFitness, date.
 */
export const addJournalEntryForDateHandler = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(req.body);

    const {
      note,
      date,
    } = req.body;

    const isPrivate = Boolean(req.body.isPrivate)
    const energy = req.body.energy !== undefined ? parseInt(req.body.energy, 10) : null;
    const physicalReadiness = req.body.physicalReadiness !== undefined ? parseInt(req.body.physicalReadiness, 10) : null;
    const motivation = req.body.motivation !== undefined ? parseInt(req.body.motivation, 10) : null;
    const stressLevel = req.body.stressLevel !== undefined ? parseInt(req.body.stressLevel, 10) : null;
    const mentalFitness = req.body.mentalFitness !== undefined ? parseInt(req.body.mentalFitness, 10) : null;

    const image = req.files?.image?.[0] || null;
    const video = req.files?.video?.[0] || null;
    console.log(image)

    const entry = await addJournalEntryForDate({
      userId,
      date,
      image,
      video,
      note,
      isPrivate,
      energy,
      physicalReadiness,
      motivation,
      stressLevel,
      mentalFitness,
    });

    res.status(200).json({
      success: true,
      message: "Journal entry added or updated successfully",
      data: entry,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller to retrieve a journal entry for a specific date.
 * Expects userId in req.user.id (set by auth middleware).
 * Date should be provided via req.query.date or req.body.date
 */
export const getJournalEntryByDateHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Prefer req.query.date, fallback to req.body.date
    const date = req.query?.date || req.body?.date;
    const entry = await getJournalEntryByDate(userId, date);

    res.status(200).json({
      success: true,
      message: entry
        ? "Journal entry retrieved successfully"
        : "No journal entry found for the date",
      data: entry,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


export const getAllJournalEntriesHandler = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Optional query params for filtering & pagination
    const {
      page = 1,
      limit = 10,
      sortOrder = "desc",   // "asc" | "desc"
      isPrivate,            // "true" | "false" | undefined
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100); // cap at 100
    const skip = (pageNum - 1) * limitNum;

    const filters = { userId };

    // Only apply isPrivate filter if explicitly passed
    if (isPrivate !== undefined) {
      filters.isPrivate = isPrivate === "true";
    }

    const entries = await getAllJournalEntries({
      filters,
      skip,
      take: limitNum,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    });

    res.status(200).json({
      success: true,
      message: entries.total === 0 ? "No journal entries found" : "Journal entries retrieved successfully",
      pagination: {
        total: entries.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(entries.total / limitNum),
      },
      data: entries.data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};