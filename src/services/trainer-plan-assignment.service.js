import prisma from "../utils/prisma.js";

export const assignPlanToTrainer = async (trainerId, planId) => {
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
  });
  if (!trainer) throw new Error("Trainer not found");

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });
  if (!plan) throw new Error("Plan not found");

  const existing = await prisma.trainerAssignedPlan.findUnique({
    where: {
      trainerId_planId: {
        trainerId,
        planId,
      },
    },
  });

  if (existing) {
    if (!existing.isActive) {
      return await prisma.trainerAssignedPlan.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: { plan: true },
      });
    }
    throw new Error("This plan is already assigned to this trainer");
  }

  return await prisma.trainerAssignedPlan.create({
    data: {
      trainerId,
      planId,
      isActive: true,
    },
    include: { plan: true },
  });
};

export const getTrainerPlans = async (trainerId, onlyActive = true) => {
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
  });
  if (!trainer) throw new Error("Trainer not found");

  const where = { trainerId };
  if (onlyActive) where.isActive = true;

  return await prisma.trainerAssignedPlan.findMany({
    where,
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
};

export const removePlanFromTrainer = async (trainerId, planId) => {
  const assignment = await prisma.trainerAssignedPlan.findUnique({
    where: {
      trainerId_planId: {
        trainerId,
        planId,
      },
    },
  });

  if (!assignment) throw new Error("Plan assignment not found");

  await prisma.trainerAssignedPlan.delete({
    where: { id: assignment.id },
  });

  return { success: true, message: "Plan removed from trainer" };
};

export const updatePlanAssignment = async (trainerId, planId, data) => {
  const assignment = await prisma.trainerAssignedPlan.findUnique({
    where: {
      trainerId_planId: {
        trainerId,
        planId,
      },
    },
  });

  if (!assignment) throw new Error("Plan assignment not found");

  return await prisma.trainerAssignedPlan.update({
    where: { id: assignment.id },
    data: {
      isActive: data.isActive !== undefined ? data.isActive : assignment.isActive,
    },
    include: { plan: true },
  });
};

export const assignMultiplePlansToTrainer = async (trainerId, planIds) => {
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
  });
  if (!trainer) throw new Error("Trainer not found");

  const plans = await prisma.plan.findMany({
    where: {
      id: { in: planIds },
    },
  });

  if (plans.length !== planIds.length) {
    throw new Error("One or more plans not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const assignments = [];
    for (const planId of planIds) {
      const existing = await tx.trainerAssignedPlan.findUnique({
        where: {
          trainerId_planId: {
            trainerId,
            planId,
          },
        },
      });

      if (!existing) {
        const assignment = await tx.trainerAssignedPlan.create({
          data: {
            trainerId,
            planId,
            isActive: true,
          },
          include: { plan: true },
        });
        assignments.push(assignment);
      }
    }
    return assignments;
  });

  return result;
};

export const removeAllPlansFromTrainer = async (trainerId) => {
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
  });
  if (!trainer) throw new Error("Trainer not found");

  const result = await prisma.trainerAssignedPlan.deleteMany({
    where: { trainerId },
  });

  return { success: true, message: `Removed ${result.count} plans from trainer` };
};
