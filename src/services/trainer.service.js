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
        gender: true,
        phoneVerified: true,
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

  if (typeof data.isActive === "string") {
    data.isActive = data.isActive === "true";
  }

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
    avatar,
    ...safeData
  } = data;
  console.log(data, avatarUrl, safeData)

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
      gender: true,
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
          id: true,
          userId: true,
          specialityId: true,
          createdAt: true,
          speciality: {
            select: {
              id: true,
              name: true,
              createdBy: true,
              createdAt: true,
              updatedAt: true
            }
          }
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
    specialities: trainer.specialities ? trainer.specialities : []
  };
};


/**
 * Method to get trainer session by month and year
 * @param {*} trainerId 
 * @param {*} month 
 * @param {*} year 
 * @returns 
 */
export const getTrainerSessionsByMonthAndYear = async (
  trainerId,
  month,
  year
) => {
  if (!trainerId) {
    throw new Error("trainerId is required");
  }

  if (!month || !year) {
    throw new Error("month and year are required");
  }

  // Parse month and year to build a date range
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (isNaN(monthNum) || isNaN(yearNum)) {
    throw new Error("Invalid month or year");
  }

  // Compute first and last day of the month
  const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59, 999));

  // Fetch trainer info for name (useful for response)
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: { firstName: true, lastName: true }
  });

  if (!trainer) throw new Error("Trainer not found");

  const trainerName =
    [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim();

    console.log(trainerName)

  // Fetch all relevant bookings for the trainer within the date range, not cancelled
  const bookings = await prisma.trainerBooking.findMany({
    where: {
      trainerId: trainerId,
      isCancelled: false,
      timeSlot: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    },
    include: {
      timeSlot: true,
      customer: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  const now = new Date();
  console.log(bookings)

  // Map bookings to required format & split into upcoming/past
  const formattedSessions = bookings.map((booking) => {
    const slot = booking.timeSlot;
    // slot date is ISO format
    const localDate = new Date(slot.date);
    const date = localDate.toISOString().split("T")[0];

    // Time as "2:00 PM - 3:00 PM"
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    const hoursFormat = (d) =>
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

    const time = `${hoursFormat(startTime)} - ${hoursFormat(endTime)}`;

    const customerName = [booking.customer?.firstName, booking.customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      date,
      time,
      trainerName,
      customerName: customerName || "",
      title: "" // empty as per instructions
    };
  });

  console.log(formattedSessions)

  const upcomingSessions = [];
  const pastSessions = [];

  formattedSessions.forEach((session, idx) => {
    // Use session's start time for comparison to now
    const startTime = bookings[idx].timeSlot.startTime
      ? new Date(bookings[idx].timeSlot.startTime)
      : null;
    if (startTime && startTime >= now) {
      upcomingSessions.push(session);
    } else {
      pastSessions.push(session);
    }
  });

  return {
    upcomingSessions,
    pastSessions
  };
};



/**
 * Fetches all active assigned customers for a given trainer,
 * including customer basic info and the first userProfileDetails.
 *
 * @param {string} trainerId - The ID of the trainer.
 * @returns {Promise<Array>} List of assigned customers with relations.
 */
import { getConversationByUsers } from "./chat.service.js";

export const getAssignedCustomersByTrainerId = async (trainerId) => {
  if (!trainerId) throw new Error("Trainer ID is required");

  try {
    // Fetch all active assignments for this trainer
    const assignedCustomers = await prisma.assignedCustomer.findMany({
      where: {
        trainerId: trainerId,
        isActive: true
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            gender: true,
            isActive: true,
            createdAt: true,
            userProfileDetails: {
              take: 1
            },
            questionnaire: true
          }
        }
      }
    });

    // For each customer, attach conversationId between trainer and customer (if exists)
    const assignedCustomersWithConversations = await Promise.all(
      assignedCustomers.map(async (ac) => {
        let conversationId = null;
        if (ac.customer && ac.customer.id && ac.customer.id !== trainerId) {
          const conversation = await getConversationByUsers(trainerId, ac.customer.id);
          conversationId = conversation ? conversation.conversationId : null;
        }
        return {
          id: ac.id,
          customer: {
            id: ac.customer.id,
            firstName: ac.customer.firstName,
            lastName: ac.customer.lastName,
            email: ac.customer.email,
            phone: ac.customer.phone,
            gender: ac.customer.gender,
            isActive: ac.customer.isActive,
            fee: 0, // TODO: later it will be dynamic
            totalSessions: 0, // TODO: later it will be dynamic
            createdAt: ac.customer.createdAt,
            userProfileDetail: ac.customer.userProfileDetails?.[0] || null,
            questionnaire: ac.customer.questionnaire,
            conversationId: conversationId
          },
          startDate: ac.startDate,
          endDate: ac.endDate,
          isActive: ac.isActive,
          createdAt: ac.createdAt
        };
      })
    );

    return assignedCustomersWithConversations;
  } catch (err) {
    throw new Error(`Failed to get assigned customers: ${err.message}`);
  }
};