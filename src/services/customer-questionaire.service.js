import prisma from "../utils/prisma.js";

// Add a new CustomerQuestionaire
export const addQuestionaire = async (data) => {
  try {
    // check if clientId exists in data
    if (!data || !data.clientId) {
      throw new Error("clientId is required");
    }
    const created = await prisma.customerQuestionaire.create({
      data: {
        clientId: data.clientId,
        clientName: data.clientName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        dateCompleted: data.dateCompleted ? new Date(data.dateCompleted) : undefined,
        heartCondition: data.heartCondition,
        chestPainDuringActivity: data.chestPainDuringActivity,
        chestPainLastMonth: data.chestPainLastMonth,
        dizzinessOrLossOfConsciousness: data.dizzinessOrLossOfConsciousness,
        boneOrJointProblem: data.boneOrJointProblem,
        bloodPressureMedication: data.bloodPressureMedication,
        otherReasonNotToExercise: data.otherReasonNotToExercise,
        pregnancyOrRecentBirth: data.pregnancyOrRecentBirth,
        chronicMedicalCondition: data.chronicMedicalCondition,
        clientSignature: data.clientSignature,
        clientSignedDate: data.clientSignedDate ? new Date(data.clientSignedDate) : undefined,
        trainerName: data.trainerName,
        trainerSignature: data.trainerSignature,
        trainerSignedDate: data.trainerSignedDate ? new Date(data.trainerSignedDate) : undefined,
      },
    });
    return created;
  } catch (err) {
    throw new Error(err.message || "Failed to create questionaire");
  }
};

// Update an existing CustomerQuestionaire by id
export const updateQuestionaireById = async (id, updateData) => {
  try {
    if (!id) {
      throw new Error("id is required");
    }
    const updated = await prisma.customerQuestionaire.update({
      where: { id },
      data: {
        clientName: updateData.clientName,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        dateCompleted: updateData.dateCompleted ? new Date(updateData.dateCompleted) : undefined,
        heartCondition: updateData.heartCondition,
        chestPainDuringActivity: updateData.chestPainDuringActivity,
        chestPainLastMonth: updateData.chestPainLastMonth,
        dizzinessOrLossOfConsciousness: updateData.dizzinessOrLossOfConsciousness,
        boneOrJointProblem: updateData.boneOrJointProblem,
        bloodPressureMedication: updateData.bloodPressureMedication,
        otherReasonNotToExercise: updateData.otherReasonNotToExercise,
        pregnancyOrRecentBirth: updateData.pregnancyOrRecentBirth,
        chronicMedicalCondition: updateData.chronicMedicalCondition,
        clientSignature: updateData.clientSignature,
        clientSignedDate: updateData.clientSignedDate ? new Date(updateData.clientSignedDate) : undefined,
        trainerName: updateData.trainerName,
        trainerSignature: updateData.trainerSignature,
        trainerSignedDate: updateData.trainerSignedDate ? new Date(updateData.trainerSignedDate) : undefined,
      },
    });
    return updated;
  } catch (err) {
    throw new Error(err.message || "Failed to update questionaire");
  }
};

/**
 * Get customer questionnaire by clientId
 */
export const getCustomerQuestionaireByClientId = async (clientId) => {
  try {
    if (!clientId) {
      throw new Error("clientId is required");
    }

    const data = await prisma.customerQuestionaire.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" }
    });

    if (!data || data.length === 0) {
      throw new Error("No questionnaire found for this client");
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch questionnaire");
  }
};