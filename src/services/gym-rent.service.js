import prisma from "../utils/prisma.js";

export const createGymRent = async (trainerId, data, adminId) => {
  try {
    const { rentAmount, rentFrequency, currency, description, notes } = data;

    if (!trainerId || rentAmount === undefined || rentAmount === null) {
      throw new Error("trainerId and rentAmount are required");
    }

    // Check if trainer exists
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { id: true, role: true },
    });

    if (!trainer) {
      throw new Error("Trainer not found");
    }

    // Check if gym rent already exists for this trainer
    const existingRent = await prisma.gymRent.findUnique({
      where: { trainerId },
    });

    if (existingRent) {
      throw new Error("Gym rent already exists for this trainer. Use update endpoint.");
    }

    const gymRent = await prisma.gymRent.create({
      data: {
        trainerId,
        rentAmount: parseFloat(rentAmount),
        rentFrequency: rentFrequency || "MONTHLY",
        currency: currency || "USD",
        description: description || null,
        notes: notes || null,
        createdBy: adminId,
      },
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return gymRent;
  } catch (err) {
    throw new Error(`Failed to create gym rent: ${err.message}`);
  }
};

export const updateGymRent = async (trainerId, data, adminId) => {
  try {
    const { rentAmount, rentFrequency, currency, description, notes } = data;

    // Check if trainer exists
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { id: true },
    });

    if (!trainer) {
      throw new Error("Trainer not found");
    }

    // Check if gym rent exists for this trainer
    const existingRent = await prisma.gymRent.findUnique({
      where: { trainerId },
    });

    if (!existingRent) {
      throw new Error("Gym rent not found for this trainer. Use create endpoint first.");
    }

    const updateData = {};
    if (rentAmount !== undefined && rentAmount !== null) updateData.rentAmount = parseFloat(rentAmount);
    if (rentFrequency !== undefined) updateData.rentFrequency = rentFrequency;
    if (currency !== undefined) updateData.currency = currency;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;

    const updatedRent = await prisma.gymRent.update({
      where: { trainerId },
      data: updateData,
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedRent;
  } catch (err) {
    throw new Error(`Failed to update gym rent: ${err.message}`);
  }
};

export const getGymRent = async (trainerId) => {
  try {
    const gymRent = await prisma.gymRent.findUnique({
      where: { trainerId },
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!gymRent) {
      throw new Error("Gym rent not found for this trainer");
    }

    return gymRent;
  } catch (err) {
    throw new Error(`Failed to fetch gym rent: ${err.message}`);
  }
};

export const getAllGymRents = async (page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    const [gymRents, total] = await Promise.all([
      prisma.gymRent.findMany({
        skip,
        take: pageSize,
        include: {
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.gymRent.count(),
    ]);

    return {
      gymRents,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (err) {
    throw new Error(`Failed to fetch gym rents: ${err.message}`);
  }
};

export const deleteGymRent = async (trainerId) => {
  try {
    const gymRent = await prisma.gymRent.findUnique({
      where: { trainerId },
    });

    if (!gymRent) {
      throw new Error("Gym rent not found for this trainer");
    }

    await prisma.gymRent.delete({
      where: { trainerId },
    });

    return { success: true, message: "Gym rent deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete gym rent: ${err.message}`);
  }
};
