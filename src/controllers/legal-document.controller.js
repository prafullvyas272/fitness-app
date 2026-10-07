import {
  upsertLegalDocument,
  getAllLegalDocumentsForAdmin,
  getPublicLegalDocument,
} from "../services/legal-document.service.js";

export const upsertLegalDocumentHandler = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { audience, type, title, content } = req.body;

    if (!audience || !type || !content) {
      return res.status(400).json({
        success: false,
        message: "audience, type, and content are required",
      });
    }

    const document = await upsertLegalDocument(adminId, {
      audience: audience?.toUpperCase(),
      type: type?.toUpperCase(),
      title,
      content,
    });

    res.status(201).json({
      success: true,
      message: "Document saved successfully",
      data: document,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllLegalDocumentsForAdminHandler = async (req, res) => {
  try {
    const { audience, type } = req.query;

    const documents = await getAllLegalDocumentsForAdmin({
      audience: audience || null,
      type: type || null,
    });

    res.status(200).json({
      success: true,
      message: "Documents fetched successfully",
      data: documents,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Public, no access token required - trainer/customer apps call this
 * directly to render the privacy policy or terms & conditions.
 */
export const getPublicLegalDocumentHandler = async (req, res) => {
  try {
    const { audience, type } = req.params;

    const document = await getPublicLegalDocument(audience?.toUpperCase(), type?.toUpperCase());

    res.status(200).json({
      success: true,
      message: "Document fetched successfully",
      data: document,
    });
  } catch (err) {
    if (err.message.includes("not been published")) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
