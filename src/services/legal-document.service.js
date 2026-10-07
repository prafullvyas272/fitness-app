import prisma from "../utils/prisma.js";

const ALLOWED_AUDIENCES = ["CUSTOMER", "TRAINER"];
const ALLOWED_TYPES = ["PRIVACY_POLICY", "TERMS_AND_CONDITIONS"];

/**
 * Admin: create or update the privacy policy / terms & conditions for one
 * audience (CUSTOMER or TRAINER). One document per (audience, type) pair -
 * posting again replaces the existing content.
 */
export const upsertLegalDocument = async (adminId, { audience, type, title, content }) => {
  if (!ALLOWED_AUDIENCES.includes(audience)) {
    throw new Error(`audience must be one of: ${ALLOWED_AUDIENCES.join(", ")}`);
  }
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`type must be one of: ${ALLOWED_TYPES.join(", ")}`);
  }
  if (!content) {
    throw new Error("content is required");
  }

  const document = await prisma.legalDocument.upsert({
    where: { audience_type: { audience, type } },
    update: { title: title || null, content, updatedBy: adminId },
    create: { audience, type, title: title || null, content, updatedBy: adminId },
  });

  return document;
};

/**
 * Admin: list all legal documents (both audiences, both types).
 */
export const getAllLegalDocumentsForAdmin = async ({ audience = null, type = null } = {}) => {
  const where = {
    ...(audience ? { audience } : {}),
    ...(type ? { type } : {}),
  };

  return prisma.legalDocument.findMany({
    where,
    orderBy: [{ audience: "asc" }, { type: "asc" }],
  });
};

/**
 * Public (no auth): fetch one published document for a given audience and
 * type, for the customer or trainer app to render.
 */
export const getPublicLegalDocument = async (audience, type) => {
  if (!ALLOWED_AUDIENCES.includes(audience)) {
    throw new Error(`audience must be one of: ${ALLOWED_AUDIENCES.join(", ")}`);
  }
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`type must be one of: ${ALLOWED_TYPES.join(", ")}`);
  }

  const document = await prisma.legalDocument.findUnique({
    where: { audience_type: { audience, type } },
  });

  if (!document) {
    throw new Error("This document has not been published yet");
  }

  return document;
};
