import stripe from "../utils/stripe.js";
import {
  createCheckoutSession,
  handleStripeWebhook,
  getMySubscription,
  cancelMySubscription,
  linkPlanToStripePrice,
  getAllSubscriptions,
  getMyTrainerPlan,
} from "../services/subscription.service.js";

export const createCheckoutHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ success: false, message: "planId is required" });

    const data = await createCheckoutSession(userId, planId);

    res.status(200).json({
      success: true,
      message: "Checkout session created. Use clientSecret to complete payment via Stripe Payment Sheet.",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  try {
    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMySubscriptionHandler = async (req, res) => {
  try {
    const data = await getMySubscription(req.user.userId);
    res.status(200).json({ success: true, message: "Subscription fetched successfully", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const cancelMySubscriptionHandler = async (req, res) => {
  try {
    const endDate = await cancelMySubscription(req.user.userId);
    res.status(200).json({
      success: true,
      message: "Subscription will be cancelled at end of billing period",
      data: { endDate },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const linkPlanToStripePriceHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { stripePriceId } = req.body;
    if (!stripePriceId) return res.status(400).json({ success: false, message: "stripePriceId is required" });

    const data = await linkPlanToStripePrice(id, stripePriceId);
    res.status(200).json({ success: true, message: "Plan linked to Stripe price successfully", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyTrainerPlanHandler = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const data = await getMyTrainerPlan(customerId);
    res.status(200).json({
      success: true,
      message: "Trainer plan fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllSubscriptionsHandler = async (req, res) => {
  try {
    const { page, pageSize, status } = req.query;
    const data = await getAllSubscriptions({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      status,
    });
    res.status(200).json({ success: true, message: "Subscriptions fetched successfully", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
