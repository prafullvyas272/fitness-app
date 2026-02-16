import {
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
  listAllSpecialities,
  getSpecialityById
} from "../services/speciality.service.js";

/**
 * Controller for creating a new speciality.
 */
export const createSpecialityHandler = async (req, res) => {
  try {
    const { name } = req.body;
    // Extract user ID from the Bearer token (populated by authMiddleware)
    const createdBy = req.user?.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Speciality name is required"
      });
    }

    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: "Creator user ID not found"
      });
    }

    const speciality = await createSpeciality({ name, createdBy });

    res.status(201).json({
      success: true,
      message: "Speciality created successfully",
      data: speciality
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Controller for updating an existing speciality by ID.
 */
export const updateSpecialityHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Speciality name is required"
      });
    }

    const updated = await updateSpeciality(id, { name });

    res.status(200).json({
      success: true,
      message: "Speciality updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Controller for deleting a speciality by ID.
 */
export const deleteSpecialityHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteSpeciality(id);

    res.status(200).json({
      success: true,
      message: "Speciality deleted successfully",
      data: deleted
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Controller for listing all specialities.
 */
export const listAllSpecialitiesHandler = async (req, res) => {
  try {
    const all = await listAllSpecialities();

    res.status(200).json({
      success: true,
      message: "Specialities fetched successfully",
      data: all
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Controller for getting a speciality by ID.
 */
export const getSpecialityByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const speciality = await getSpecialityById(id);

    res.status(200).json({
      success: true,
      message: "Speciality fetched successfully",
      data: speciality
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
    });
  }
};
