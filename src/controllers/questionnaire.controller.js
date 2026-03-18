import { addQuestionnaireDetailsForClient, updateQuestionnaireNotes } from "../services/questionnaire.service.js";

/**
 * Controller to add or update questionnaire details for a client (user).
 * Extracts payload from req.body and invokes the service function.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const addQuestionnaireDetailsForClientHandler = async (req, res) => {
  try {
    // Extract the payload from request body
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
    } = req.body;

    const questionnaire = await addQuestionnaireDetailsForClient({
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
    });

    res.status(200).json({
      success: true,
      message: "Questionnaire details updated successfully.",
      data: questionnaire
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/**
 * Controller to update only the notes field for a questionnaire by userId.
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const updateQuestionnaireNotesHandler = async (req, res) => {
  try {
    const { userId, notes } = req.body;

    const updatedQuestionnaire = await updateQuestionnaireNotes({ userId, notes });

    res.status(200).json({
      success: true,
      message: "Questionnaire notes updated successfully.",
      data: updatedQuestionnaire
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};