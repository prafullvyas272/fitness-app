import prisma from "../utils/prisma.js";

/**
 * Adds or updates questionnaire details for a specific client (user).
 * If a questionnaire for the user already exists, updates it; else, creates one.
 * 
 * @param {Object} data - Questionnaire payload.
 * @param {string} data.userId - User (client) ID.
 * @param {string} data.clientName
 * @param {number} data.age
 * @param {number} data.heightCm
 * @param {number} data.weightKg
 * @param {string} [data.dietaryRestrictions]
 * @param {string} [data.goals]
 * @param {string} [data.medicalHistory]
 * @param {string} [data.exerciseExperience]
 * @param {string} [data.availability]
 * @param {string} [data.trainingPreferences]
 * @param {string} [data.notes]
 * @returns {Promise<Object>} - The created/updated questionnaire record.
 * @throws {Error} - If operation fails.
 */
export const addQuestionnaireDetailsForClient = async (data) => {
  try {
    // Destructure data to extract only valid fields
    const {
      userId,
      clientName,
      age,
      heightCm,
      weightKg,
      dietaryRestrictions,
      goals,
      medicalHistory,
      exerciseExperience,
      availability,
      trainingPreferences,
      notes
    } = data;

    // Ensure required fields are present
    if (!userId || !clientName || !age || !heightCm || !weightKg) {
      throw new Error("Missing required fields for questionnaire.");
    }

    // Upsert: If a questionnaire for this user exists, update; else, create
    const questionnaire = await prisma.questionnaire.upsert({
      where: { userId },
      create: {
        userId,
        clientName,
        age,
        heightCm,
        weightKg,
        dietaryRestrictions,
        goals,
        medicalHistory,
        exerciseExperience,
        availability,
        trainingPreferences,
        notes
      },
      update: {
        clientName,
        age,
        heightCm,
        weightKg,
        dietaryRestrictions,
        goals,
        medicalHistory,
        exerciseExperience,
        availability,
        trainingPreferences,
        notes
      }
    });

    return questionnaire;
  } catch (err) {
    throw new Error(`Failed to add questionnaire details: ${err.message}`);
  }
};


/**
 * Updates only the notes field for a questionnaire by userId.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.userId - The ID of the user whose questionnaire should be updated.
 * @param {string} params.notes - The new notes value.
 * @returns {Promise<Object>} The updated questionnaire object.
 */
export const updateQuestionnaireNotes = async ({ userId, notes }) => {
  if (!userId) {
    throw new Error("User ID is required to update questionnaire notes.");
  }
  if (typeof notes !== "string") {
    throw new Error("Notes must be a string.");
  }

  // Dummy values for demonstration purposes
  const clientName = "Dummy Client";
  const age = 25;
  const heightCm = 170;
  const weightKg = 70.0;

  try {
    let updated;
    try {
      // Try updating the questionnaire notes
      updated = await prisma.questionnaire.update({
        where: { userId },
        data: { notes }
      });
    } catch (err) {
      // If not found (Prisma throws), create with dummy values
      if (err.code === "P2025") {
        // Prisma error code for "Record to update not found."
        updated = await prisma.questionnaire.create({
          data: {
            userId,
            clientName: "",
            age: 18,
            heightCm: 0,
            weightKg: 0.0,
            notes
          }
        });
      } else {
        throw err;
      }
    }
    return updated;
  } catch (err) {
    throw new Error(`Failed to update questionnaire notes: ${err.message}`);
  }
};

/**
 * Get questionnaire details by userId
 * 
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const getQuestionnaireByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId }
    });

    if (!questionnaire) {
      throw new Error("Questionnaire not found.");
    }

    return questionnaire;
  } catch (err) {
    throw new Error(`Failed to fetch questionnaire: ${err.message}`);
  }
};