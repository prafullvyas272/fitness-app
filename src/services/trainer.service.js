import prisma from "../utils/prisma.js";
import { getHashedPassword } from "../utils/password.js";

/**
 * Create a new Trainer user.
 * @param {object} data - User data for trainer creation.
 * @returns {object} The created trainer user.
 */
export const createTrainer = async (data) => {
  // Ensure roleId is for Trainer
  const trainerRole = await prisma.role.findUnique({
    where: { name: 'Trainer' },
    select: { id: true }
  });
  if (!trainerRole) {
    throw new Error("Trainer role not found");
  }

  // Check for required fields
  if (!data.email) {
    throw new Error("Email is required.");
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });
  if (existing) {
    throw new Error("Email already in use.");
  }

  const hashedPassword = await getHashedPassword(data.password);

  // Wrap all operations that should be atomic in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the trainer user first
    const trainer = await tx.user.create({
      data: {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword,
        roleId: trainerRole.id,
        gender: data.gender,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        userProfileDetails: true,

      },
    });

    // Create a UserProfileDetail record for the trainer if profile fields are provided
    const profileFields = {};
    if (
      data.hostGymName !== undefined ||
      data.hostGymAddress !== undefined ||
      data.address !== undefined ||
      data.bio !== undefined ||
      data.avatarUrl !== undefined ||
      data.avatarPublicId !== undefined
    ) {
      if (data.hostGymName !== undefined) profileFields.hostGymName = data.hostGymName;
      if (data.hostGymAddress !== undefined) profileFields.hostGymAddress = data.hostGymAddress;
      if (data.address !== undefined) profileFields.address = data.address;
      if (data.bio !== undefined) profileFields.bio = data.bio;
      if (data.avatarUrl !== undefined) profileFields.avatarUrl = data.avatarUrl;
      if (data.avatarPublicId !== undefined) profileFields.avatarPublicId = data.avatarPublicId;


      await tx.userProfileDetail.create({
        data: {
          userId: trainer.id,
          ...profileFields
        }
      });
    }

    const trainerWithProfile = await tx.user.findUnique({
      where: { id: trainer.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        userProfileDetails: true,
      }
    });
    return trainerWithProfile;
  });

  return result;
};

/**
 * Update an existing Trainer user.
 * @param {string} trainerId - The ID of the trainer to update.
 * @param {object} data - The trainer data to update.
 * @returns {object} The updated trainer user.
 */
export const updateTrainer = async (trainerId, data) => {
  if (!trainerId) throw new Error("Trainer ID is required");

  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    include: {
      role: true
    }
  });

  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser && existingUser.id !== trainerId) {
      throw new Error("Email already in use.");
    }
  }

  if (!trainer) throw new Error("Trainer not found");
  if (trainer.role.name !== "Trainer")
    throw new Error("User is not a trainer");

  const {
    roleId,
    hostGymName,
    hostGymAddress,
    address,
    bio,
    avatarUrl,
    gender,
    ...safeData
  } = data;

  const result = await prisma.$transaction(async (tx) => {
    // ✅ Update User table only with valid fields
    const updatedTrainer = await tx.user.update({
      where: { id: trainerId },
      data: safeData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        userProfileDetails: true
      },
    });

    // ✅ Handle profile fields separately
    const profileFields = {};

    if (hostGymName !== undefined) profileFields.hostGymName = hostGymName;
    if (hostGymAddress !== undefined) profileFields.hostGymAddress = hostGymAddress;
    if (address !== undefined) profileFields.address = address;
    if (bio !== undefined) profileFields.bio = bio;
    if (avatarUrl !== undefined) profileFields.avatarUrl = avatarUrl;


    if (Object.keys(profileFields).length > 0) {
      const existingProfile = await tx.userProfileDetail.findFirst({
        where: { userId: trainerId },
        select: { id: true, userId: true }
      });

      if (existingProfile) {
        await tx.userProfileDetail.update({
          where: { id: existingProfile.id },
          data: profileFields,
        });
      } else {
        await tx.userProfileDetail.create({
          data: {
            userId: trainerId,
            ...profileFields,
          },
        });
      }
    }

    const updatedTrainerData = await tx.user.findUnique({
      where: { id: trainerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        roleId: true,
        gender: true,
        createdAt: true,
        userProfileDetails: true
      },
    });

    return updatedTrainerData;
  });

  return result;
};


/**
 * Delete a Trainer user.
 * @param {string} trainerId - The ID of the trainer to delete.
 * @returns {object} The deleted trainer user.
 */
export const deleteTrainer = async (trainerId) => {
  if (!trainerId) throw new Error("Trainer ID is required");

  // Ensure user exists and is a trainer
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: { id: true, role: { select: { name: true } } }
  });
  if (!trainer) {
    throw new Error("Trainer not found");
  }
  if (trainer.role.name !== "Trainer") {
    throw new Error("User is not a trainer");
  }

  // Delete the trainer user
  const deletedTrainer = await prisma.user.delete({
    where: { id: trainerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      roleId: true,
      createdAt: true,
    },
  });

  return deletedTrainer;
};

/**
 * Get the profile data for a specific Trainer.
 * @param {string} trainerId - The ID of the trainer.
 * @returns {object} The trainer's profile data.
 */
export const showTrainerProfileData = async (trainerId) => {
  if (!trainerId) throw new Error("Trainer ID is required");

  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      roleId: true,
      createdAt: true,
      assignedCustomersAsTrainer: {
        select: {
          id: true,
          customerId: true,
          isActive: true,
          startDate: true,
          endDate: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        }
      },
      specialities: {
        select: {
          specialityId: true
        }
      },
      userProfileDetails: {
        select: {
          id: true,
          address: true,
          bio: true,
          hostGymName: true,
          hostGymAddress: true,
          avatarUrl: true,
          dob: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    }
  });

  if (!trainer) {
    throw new Error("Trainer not found");
  }

  // Optionally, format specialities array to flatten
  return {
    ...trainer,
    specialities: trainer.specialities ? trainer.specialities.map(s => ({ specialityId: s.specialityId })) : []
  };
};