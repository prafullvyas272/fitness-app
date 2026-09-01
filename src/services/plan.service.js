import prisma from "../utils/prisma.js";
import stripe from "../utils/stripe.js";

/**
 * Create a new plan with auto-generated Stripe Product & Price
 * @param {Object} data - { name: string, price: number, features: string[], isPopular?: boolean, duration?: string, createdBy: string }
 * @returns {Promise<Object>}
 */
export const createPlan = async (data) => {
  try {
    const durationMap = {
      WEEKLY: "week",
      MONTHLY: "month",
      QUARTERLY: "quarter",
      YEARLY: "year"
    };
    const stripeInterval = durationMap[data.duration || "MONTHLY"];

    const stripeProduct = await stripe.products.create({
      name: data.name,
      description: data.features?.join(", ") || "Fitness plan",
      metadata: { duration: data.duration || "MONTHLY" }
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(data.price * 100),
      currency: "usd",
      recurring: { interval: stripeInterval, interval_count: 1 }
    });

    const newPlan = await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        features: data.features,
        isPopular: data.isPopular || false,
        duration: data.duration || "MONTHLY",
        createdBy: data.createdBy,
        stripePriceId: stripePrice.id
      }
    });
    return newPlan;
  } catch (err) {
    throw new Error('Failed to create plan: ' + err.message);
  }
};

/**
 * Update an existing plan by ID.
 * @param {String} id - Plan ID
 * @param {Object} data - Fields to update, e.g., { name, price, features, isPopular }
 * @returns {Promise<Object>}
 */
export const updatePlan = async (id, data) => {
  try {
    const updated = await prisma.plan.update({
      where: { id },
      data: data
    });
    return updated;
  } catch (err) {
    if (
      err.code === "P2025" ||
      (err.message && err.message.toLowerCase().includes("record to update not found"))
    ) {
      throw new Error("Plan not found");
    }
    throw new Error('Failed to update plan: ' + err.message);
  }
};

/**
 * Delete a plan by ID.
 * @param {String} id - Plan ID
 * @returns {Promise<Object>}
 */
export const deletePlan = async (id) => {
  try {
    await prisma.user.updateMany({
      where: { planId: id },
      data: { planId: null },
    });

    await prisma.subscription.deleteMany({
      where: { planId: id },
    });

    const deleted = await prisma.plan.delete({
      where: { id }
    });
    return deleted;
  } catch (err) {
    if (
      err.code === "P2025" ||
      (err.message && err.message.toLowerCase().includes("record to delete does not exist"))
    ) {
      throw new Error("Plan not found");
    }
    throw new Error('Failed to delete plan: ' + err.message);
  }
};

/**
 * Get a paginated list of plans.
 * @param {number} [page=1] - Page number (1-based)
 * @param {number} [pageSize=10] - Number of plans per page
 * @returns {Promise<Object>} - { plans, pagination }
 */
export const listAllPlans = async (page = 1, pageSize = 10) => {
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    const [total, plans] = await Promise.all([
      prisma.plan.count(),
      prisma.plan.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);
    return {
      plans,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (err) {
    throw new Error('Failed to fetch plans: ' + err.message);
  }
};

/**
 * Get a plan by ID.
 * @param {String} id - Plan ID
 * @returns {Promise<Object>}
 */
export const getPlanById = async (id) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id }
    });
    if (!plan) {
      throw new Error("Plan not found");
    }
    return plan;
  } catch (err) {
    throw new Error('Failed to fetch plan: ' + err.message);
  }
};