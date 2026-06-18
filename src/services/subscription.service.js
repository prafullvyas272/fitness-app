import prisma from "../utils/prisma.js";
import stripe from "../utils/stripe.js";

const getOrCreateStripeCustomer = async (user) => {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
};

/**
 * Create Stripe subscription — returns clientSecret + ephemeralKey for mobile Payment Sheet.
 */
export const createCheckoutSession = async (userId, planId) => {
  const [user, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.plan.findUnique({ where: { id: planId } }),
  ]);

  if (!user) throw new Error("User not found");
  if (!plan) throw new Error("Plan not found");
  if (!plan.stripePriceId) throw new Error("This plan is not linked to a Stripe price yet. Contact admin.");

  const existing = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (existing) throw new Error("You already have an active subscription");

  const stripeCustomerId = await getOrCreateStripeCustomer(user);

  // Create subscription in incomplete state — gives us a payment intent client secret
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: plan.stripePriceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  const paymentIntent = subscription.latest_invoice.payment_intent;

  // Create ephemeral key for mobile Payment Sheet
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: stripeCustomerId },
    { apiVersion: "2023-10-16" }
  );

  // Save pending subscription to DB
  await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: "INCOMPLETE",
      stripeSubscriptionId: subscription.id,
      stripeStatus: subscription.status,
    },
  });

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customerId: stripeCustomerId,
  };
};

/**
 * Handle Stripe webhook events.
 */
export const handleStripeWebhook = async (event) => {
  switch (event.type) {
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription;
      if (!stripeSubscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const endDate = new Date(subscription.current_period_end * 1000);

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
          status: "ACTIVE",
          stripeStatus: subscription.status,
          startDate: new Date(),
          endDate,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (!invoice.subscription) break;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription },
        data: { status: "PAST_DUE", stripeStatus: "past_due" },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const endDate = new Date(sub.current_period_end * 1000);
      let status = "ACTIVE";
      if (sub.status === "canceled") status = "CANCELLED";
      else if (sub.status === "past_due") status = "PAST_DUE";
      else if (sub.status === "incomplete") status = "INCOMPLETE";

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { stripeStatus: sub.status, status, endDate },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "CANCELLED", stripeStatus: "canceled" },
      });
      break;
    }

    default:
      break;
  }
};

/**
 * Get authenticated trainer's current subscription.
 */
export const getMySubscription = async (userId) => {
  return prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
};

/**
 * Cancel at period end (not immediately).
 */
export const cancelMySubscription = async (userId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!subscription) throw new Error("No active subscription found");
  if (!subscription.stripeSubscriptionId) throw new Error("Stripe subscription ID missing");

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { stripeStatus: "cancel_at_period_end" },
  });

  return subscription.endDate;
};

/**
 * Link a Stripe Price ID to a plan (superadmin).
 */
export const linkPlanToStripePrice = async (planId, stripePriceId) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("Plan not found");

  return prisma.plan.update({
    where: { id: planId },
    data: { stripePriceId },
  });
};

/**
 * Customer: get the plan assigned to their trainer.
 */
export const getMyTrainerPlan = async (customerId) => {
  const assignment = await prisma.assignedCustomer.findFirst({
    where: { customerId, isActive: true },
    include: {
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          planId: true,
          plan: true,
        },
      },
    },
  });

  if (!assignment) throw new Error("You are not assigned to any trainer");
  if (!assignment.trainer.plan) throw new Error("Your trainer does not have a plan assigned yet");

  return {
    trainer: {
      id: assignment.trainer.id,
      firstName: assignment.trainer.firstName,
      lastName: assignment.trainer.lastName,
    },
    plan: assignment.trainer.plan,
  };
};

/**
 * Admin: get all subscriptions.
 */
export const getAllSubscriptions = async ({ page = 1, pageSize = 10, status } = {}) => {
  if (page < 1) page = 1;
  const skip = (page - 1) * pageSize;
  const where = status ? { status } : {};

  const [total, subscriptions] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        plan: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return {
    subscriptions,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
};
