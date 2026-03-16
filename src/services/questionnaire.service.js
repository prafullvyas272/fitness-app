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