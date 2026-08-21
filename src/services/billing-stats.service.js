import prisma from "../utils/prisma.js";

export const getActiveSubscriptionsCount = async () => {
  const count = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
    },
  });
  return count;
};

export const getTotalPlansCount = async () => {
  const count = await prisma.plan.count();
  return count;
};

export const getExpiringPlansCount = async () => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const count = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
  });
  return count;
};

export const getBillingStats = async () => {
  const [activeSubscriptions, totalPlans, expiringPlans] = await Promise.all([
    getActiveSubscriptionsCount(),
    getTotalPlansCount(),
    getExpiringPlansCount(),
  ]);

  return {
    activeSubscriptions,
    totalPlans,
    expiringPlans,
  };
};
