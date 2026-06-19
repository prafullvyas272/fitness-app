import express from "express";
import {
  createCheckoutHandler,
  stripeWebhookHandler,
  getMySubscriptionHandler,
  cancelMySubscriptionHandler,
  linkPlanToStripePriceHandler,
  getAllSubscriptionsHandler,
  getMyTrainerPlanHandler,
} from "../controllers/subscription.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

// Raw body is applied at app.js level before express.json()
router.post("/webhooks/stripe", stripeWebhookHandler);

/**
 * @swagger
 * /api/subscriptions/checkout:
 *   post:
 *     summary: Create Stripe subscription (Trainer)
 *     description: Returns clientSecret, ephemeralKey and customerId for Stripe Payment Sheet on mobile.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 example: "6a30d9953adf5dd2cb438d53"
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptionId:
 *                       type: string
 *                     clientSecret:
 *                       type: string
 *                     ephemeralKey:
 *                       type: string
 *                     customerId:
 *                       type: string
 */
/**
 * @swagger
 * /api/customer/my-trainer-plan:
 *   get:
 *     summary: Get the plan assigned to the customer's trainer (Customer only)
 *     description: Returns the plan that the admin has assigned to the customer's trainer. Customer uses this planId to subscribe.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer plan fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         price:
 *                           type: number
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                         duration:
 *                           type: string
 *       400:
 *         description: Not assigned to any trainer or trainer has no plan
 */
router.get("/customer/my-trainer-plan", authMiddleware, getMyTrainerPlanHandler);

router.post("/subscriptions/checkout", authMiddleware, createCheckoutHandler);

/**
 * @swagger
 * /api/subscriptions/me:
 *   get:
 *     summary: Get current trainer's subscription
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription fetched
 */
router.get("/subscriptions/me", authMiddleware, getMySubscriptionHandler);

/**
 * @swagger
 * /api/subscriptions/me:
 *   delete:
 *     summary: Cancel current subscription (at period end)
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription scheduled for cancellation
 */
router.delete("/subscriptions/me", authMiddleware, cancelMySubscriptionHandler);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all subscriptions (Admin)
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, CANCELLED, PAST_DUE, INCOMPLETE]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subscriptions fetched
 */
router.get("/subscriptions", authMiddleware, superadminMiddleware, getAllSubscriptionsHandler);

/**
 * @swagger
 * /api/plans/{id}/stripe-price:
 *   patch:
 *     summary: Link plan to Stripe Price ID (Admin)
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stripePriceId
 *             properties:
 *               stripePriceId:
 *                 type: string
 *                 example: "price_1TjccUAQfjCeRChbFAHOyNVk"
 *     responses:
 *       200:
 *         description: Plan linked to Stripe price
 */
router.patch("/plans/:id/stripe-price", authMiddleware, superadminMiddleware, linkPlanToStripePriceHandler);

export default router;
