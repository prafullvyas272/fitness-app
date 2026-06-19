import prisma from "../utils/prisma.js";
import { getHashedPassword } from "../utils/password.js";

const getMentorRole = async () => {
  const role = await prisma.role.findUnique({ where: { name: "Mentor" } });
  if (!role) throw new Error("Mentor role not found. Seed the Mentor role first.");
  return role;
};

const resolveSpecialityIds = async (specialityNames) => {
  if (!specialityNames) return [];
  const names = specialityNames.split(",").map(n => n.trim()).filter(Boolean);
  if (names.length === 0) return [];
  const records = await prisma.speciality.findMany({
    where: { name: { in: names } },
    select: { id: true },
  });
  return records.map(r => r.id);
};

export const createMentor = async (data) => {
  const { firstName, lastName, email, phone, password, title, experience, region, maxPTs, avatarUrl, avatarPublicId, status, specialityIds } = data;

  if (!email) throw new Error("Email is required");
  if (!password) throw new Error("Password is required");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const [mentorRole, hashedPassword, resolvedIds] = await Promise.all([
    getMentorRole(),
    getHashedPassword(password),
    resolveSpecialityIds(specialityIds),
  ]);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        roleId: mentorRole.id,
        isActive: true,
      },
    });

    const mentorProfile = await tx.mentorProfile.create({
      data: {
        userId: user.id,
        title: title || null,
        experience: experience ? parseInt(experience) : null,
        region: region || null,
        maxPTs: maxPTs ? parseInt(maxPTs) : 30,
        avatarUrl: avatarUrl || null,
        avatarPublicId: avatarPublicId || null,
        status: status || "ACTIVE",
      },
    });

    if (resolvedIds.length > 0) {
      await tx.userSpeciality.createMany({
        data: resolvedIds.map(id => ({ userId: user.id, specialityId: id })),
      });
    }

    return { ...user, mentorProfile };
  });

  return result;
};

export const getAllMentors = async ({ page = 1, pageSize = 10, status } = {}) => {
  if (page < 1) page = 1;
  const skip = (page - 1) * pageSize;

  const mentorRole = await getMentorRole();

  const where = {
    roleId: mentorRole.id,
    ...(status && {
      mentorProfile: { status },
    }),
  };

  const [total, mentors] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        isActive: true,
        createdAt: true,
        mentorProfile: true,
        specialities: {
          include: { speciality: true },
        },
        mentorTrainerAssignments: {
          select: { trainerId: true },
        },
      },
    }),
  ]);

  const formatted = mentors.map(m => ({
    ...m,
    assignedPTs: m.mentorTrainerAssignments.length,
    mentorTrainerAssignments: undefined,
  }));

  return {
    mentors: formatted,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
};

export const getMentorById = async (id) => {
  const mentor = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      isActive: true,
      createdAt: true,
      mentorProfile: true,
      specialities: {
        include: { speciality: true },
      },
      mentorTrainerAssignments: {
        include: {
          trainer: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
        },
      },
    },
  });

  if (!mentor) throw new Error("Mentor not found");

  return {
    ...mentor,
    assignedPTs: mentor.mentorTrainerAssignments.length,
    assignedTrainers: mentor.mentorTrainerAssignments.map(a => a.trainer),
    mentorTrainerAssignments: undefined,
  };
};

export const updateMentor = async (id, data, avatarFile) => {
  const mentor = await prisma.user.findUnique({
    where: { id },
    include: { mentorProfile: true },
  });
  if (!mentor) throw new Error("Mentor not found");

  const { firstName, lastName, phone, title, experience, region, maxPTs, status, specialityIds } = data;

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
      },
    });

    if (mentor.mentorProfile) {
      await tx.mentorProfile.update({
        where: { userId: id },
        data: {
          ...(title !== undefined && { title }),
          ...(experience !== undefined && { experience: parseInt(experience) }),
          ...(region !== undefined && { region }),
          ...(maxPTs !== undefined && { maxPTs: parseInt(maxPTs) }),
          ...(status !== undefined && { status }),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
          ...(data.avatarPublicId !== undefined && { avatarPublicId: data.avatarPublicId }),
        },
      });
    }

    if (specialityIds !== undefined) {
      await tx.userSpeciality.deleteMany({ where: { userId: id } });
      const validSpecialityIds = specialityIds.filter(sid => sid != null);
      if (validSpecialityIds.length > 0) {
        await tx.userSpeciality.createMany({
          data: validSpecialityIds.map(sid => ({ userId: id, specialityId: sid })),
        });
      }
    }

    return getMentorById(id);
  });
};

export const getUnassignedTrainers = async () => {
  const trainerRole = await prisma.role.findUnique({ where: { name: "Trainer" } });
  if (!trainerRole) throw new Error("Trainer role not found");

  // Trainers who already have a mentor assignment
  const assigned = await prisma.mentorTrainerAssignment.findMany({
    select: { trainerId: true },
  });
  const assignedIds = assigned.map(a => a.trainerId);

  return prisma.user.findMany({
    where: {
      roleId: trainerRole.id,
      isActive: true,
      id: { notIn: assignedIds },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
    orderBy: { firstName: "asc" },
  });
};

export const assignTrainers = async (mentorId, trainerIds) => {
  const mentor = await prisma.user.findUnique({ where: { id: mentorId }, include: { mentorProfile: true } });
  if (!mentor || !mentor.mentorProfile) throw new Error("Mentor not found");

  const maxPTs = mentor.mentorProfile.maxPTs;

  // Check how many trainers are already assigned to this mentor
  const currentCount = await prisma.mentorTrainerAssignment.count({ where: { mentorId } });
  if (currentCount + trainerIds.length > maxPTs) {
    throw new Error(`Cannot assign ${trainerIds.length} trainer(s). Mentor capacity is ${maxPTs}, currently has ${currentCount} assigned.`);
  }

  // Check none of the trainers are already assigned to any mentor
  const alreadyAssigned = await prisma.mentorTrainerAssignment.findMany({
    where: { trainerId: { in: trainerIds } },
    select: { trainerId: true },
  });
  if (alreadyAssigned.length > 0) {
    const ids = alreadyAssigned.map(a => a.trainerId).join(", ");
    throw new Error(`Trainer(s) already assigned to another mentor: ${ids}`);
  }

  await prisma.mentorTrainerAssignment.createMany({
    data: trainerIds.map(trainerId => ({ mentorId, trainerId })),
  });

  return getMentorById(mentorId);
};

export const unassignTrainer = async (mentorId, trainerId) => {
  const assignment = await prisma.mentorTrainerAssignment.findFirst({
    where: { mentorId, trainerId },
  });
  if (!assignment) throw new Error("Assignment not found");

  await prisma.mentorTrainerAssignment.delete({ where: { id: assignment.id } });

  return getMentorById(mentorId);
};

export const deleteMentor = async (id) => {
  const mentor = await prisma.user.findUnique({ where: { id } });
  if (!mentor) throw new Error("Mentor not found");

  return prisma.$transaction(async (tx) => {
    await tx.mentorTrainerAssignment.deleteMany({ where: { mentorId: id } });
    await tx.userSpeciality.deleteMany({ where: { userId: id } });
    await tx.mentorProfile.deleteMany({ where: { userId: id } });
    return tx.user.delete({ where: { id } });
  });
};
