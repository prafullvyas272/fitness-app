import prisma from "../utils/prisma.js";

export const getAllMentors = async ({ page = 1, limit = 20, search = null } = {}) => {
  if (page < 1) page = 1;
  const skip = (page - 1) * limit;

  const where = search ? {
    OR: [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ]
  } : {};

  const [total, mentors] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        isActive: true,
        createdAt: true,
        userProfileDetails: true,
        mentorProfile: true,
        mentorTrainerAssignments: { select: { trainerId: true } },
        _count: {
          select: { mentorTrainerAssignments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const formattedMentors = mentors.map(mentor => ({
    id: mentor.id,
    firstName: mentor.firstName,
    lastName: mentor.lastName,
    fullName: `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim(),
    email: mentor.email,
    phone: mentor.phone,
    gender: mentor.gender,
    isActive: mentor.isActive,
    avatar: mentor.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
    assignedTrainers: mentor._count.mentorTrainerAssignments,
    mentorProfile: mentor.mentorProfile ? {
      title: mentor.mentorProfile.title,
      experience: mentor.mentorProfile.experience,
      region: mentor.mentorProfile.region,
      maxPTs: mentor.mentorProfile.maxPTs
    } : null,
    createdAt: mentor.createdAt ? mentor.createdAt.toISOString() : null
  }));

  return {
    mentors: formattedMentors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getMentorById = async (mentorId) => {
  const mentor = await prisma.user.findUnique({
    where: { id: mentorId },
    include: {
      userProfileDetails: true,
      mentorProfile: true,
      mentorTrainerAssignments: {
        include: {
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userProfileDetails: true
            }
          }
        }
      },
      notifications: { take: 10, orderBy: { createdAt: "desc" } },
      role: { select: { name: true } }
    }
  });

  if (!mentor) throw new Error("Mentor not found");

  return {
    mentor: {
      id: mentor.id,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      fullName: `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim(),
      email: mentor.email,
      phone: mentor.phone,
      gender: mentor.gender,
      isActive: mentor.isActive,
      role: mentor.role.name,
      avatar: mentor.userProfileDetails?.[0]?.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
      profile: mentor.userProfileDetails?.[0] || null,
      mentorProfile: mentor.mentorProfile ? {
        title: mentor.mentorProfile.title,
        experience: mentor.mentorProfile.experience,
        region: mentor.mentorProfile.region,
        maxPTs: mentor.mentorProfile.maxPTs,
        bio: mentor.mentorProfile.bio
      } : null,
      assignedTrainers: mentor.mentorTrainerAssignments.map(a => ({
        trainerId: a.trainerId,
        trainerName: `${a.trainer.firstName || ''} ${a.trainer.lastName || ''}`.trim(),
        trainerEmail: a.trainer.email,
        trainerAvatar: a.trainer.userProfileDetails?.[0]?.avatarUrl
      })),
      totalAssignedTrainers: mentor.mentorTrainerAssignments.length,
      recentNotifications: mentor.notifications.length,
      createdAt: mentor.createdAt ? mentor.createdAt.toISOString() : null
    }
  };
};

export const getMentorStats = async () => {
  const mentors = await prisma.user.findMany({
    where: {
      role: {
        name: "Mentor"
      }
    },
    include: {
      mentorTrainerAssignments: true
    }
  });

  const totalMentors = mentors.length;
  const activeMentors = mentors.filter(m => m.isActive).length;
  const totalTrainersManaged = mentors.reduce((sum, m) => sum + m.mentorTrainerAssignments.length, 0);
  const avgTrainersPerMentor = totalMentors > 0 ? (totalTrainersManaged / totalMentors).toFixed(1) : 0;

  return {
    stats: {
      totalMentors,
      activeMentors,
      inactiveMentors: totalMentors - activeMentors,
      totalTrainersManaged,
      avgTrainersPerMentor: parseFloat(avgTrainersPerMentor)
    }
  };
};
