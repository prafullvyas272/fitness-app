import prisma from '../utils/prisma.js';

/**
 * Create a new speciality.
 * @param {Object} data - { name: string, createdBy: string }
 * @returns {Promise<Object>}
 */
export const createSpeciality = async (data) => {
  try {
    const speciality = await prisma.speciality.create({
      data: {
        name: data.name,
        createdBy: data.createdBy
      }
    });
    return speciality;
  } catch (err) {
    throw new Error('Failed to create speciality: ' + err.message);
  }
};

/**
 * Update an existing speciality by ID.
 * @param {String} id - Speciality ID
 * @param {Object} data - Fields to update, e.g., { name }
 * @returns {Promise<Object>}
 */
export const updateSpeciality = async (id, data) => {
  try {
    const updated = await prisma.speciality.update({
      where: { id },
      data: {
        name: data.name
      }
    });
    return updated;
  } catch (err) {
    throw new Error('Failed to update speciality: ' + err.message);
  }
};

/**
 * Delete a speciality by ID.
 * @param {String} id - Speciality ID
 * @returns {Promise<Object>}
 */
export const deleteSpeciality = async (id) => {
  try {
    const deleted = await prisma.speciality.delete({
      where: { id }
    });
    return deleted;
  } catch (err) {
    throw new Error('Failed to delete speciality: ' + err.message);
  }
};

/**
 * List all specialities.
 * @returns {Promise<Array>}
 */
export const listAllSpecialities = async () => {
  try {
    const all = await prisma.speciality.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return all;
  } catch (err) {
    throw new Error('Failed to list specialities: ' + err.message);
  }
};

/**
 * Get a speciality by ID.
 * @param {String} id - Speciality ID
 * @returns {Promise<Object>}
 */
export const getSpecialityById = async (id) => {
  try {
    const speciality = await prisma.speciality.findUnique({
      where: { id }
    });
    if (!speciality) {
      throw new Error('Speciality not found');
    }
    return speciality;
  } catch (err) {
    throw new Error('Failed to get speciality: ' + err.message);
  }
};
