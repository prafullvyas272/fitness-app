import {
  addQuestionaire,
  updateQuestionaireById,
} from "../services/customer-questionaire.service.js";

// Controller: create a new CustomerQuestionaire
export const addQuestionaireHandler = async (req, res) => {
  try {
    const data = req.body;
    const result = await addQuestionaire(data);
    res.status(201).json({
      success: true,
      message: "Customer questionaire created successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Controller: update a CustomerQuestionaire by id
export const updateQuestionaireByIdHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await updateQuestionaireById(id, data);
    res.status(200).json({
      success: true,
      message: "Customer questionaire updated successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

import { getCustomerQuestionaireByClientId } from "../services/customer-questionaire.service.js";

/**
 * Controller: get customer questionnaire by clientId (for trainer)
 */
export const getCustomerQuestionaireHandler = async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await getCustomerQuestionaireByClientId(clientId);

    res.status(200).json({
      success: true,
      message: "Customer questionnaire fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};