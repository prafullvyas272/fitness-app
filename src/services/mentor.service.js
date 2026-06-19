import prisma from "../utils/prisma.js";
import { getHashedPassword } from "../utils/password.js";

const getMentorRole = async () => {
  const role = await prisma.role.findUnique({ where: { name: "Mentor" } });
  if (!role) throw new Error("Mentor role not found. Seed the Mentor role first.");
  return role;
};

export const createMentor = async (data) => {
  const { firstName, lastName, email, phone, password, title, experience, region, maxPTs, avatarUrl, avatarPublicId, status, specialityIds } = data;

  if (!email) throw new Error("Email is required");
  if (!password) throw new Error("Password is required");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const [mentorRole, hashedPassword] = await Promise.all([
    getMentorRole(),
    getHashedPassword(password),
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

    const validSpecialityIds = (specialityIds || []).filter(id => id != null);
    if (validSpecialityIds.length > 0) {
      await tx.userSpeciality.createMany({
        data: validSpecialityIds.map(id => ({ userId: user.id, specialityId: id })),
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
