import express from "express";
import {
  requestAccountDeletionHandler,
  getMyAccountDeletionRequestHandler,
  getAllAccountDeletionRequestsHandler,
  getTrainerAccountDeletionRequestsHandler,
  getCustomerAccountDeletionRequestsHandler,
  updateAccountDeletionRequestStatusHandler,
} from "../controllers/account-deletion.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/account-deletion-requests:
 *   post:
 *     summary: Request account deletion
 *     description: Trainer or Customer submits a request to delete their own account. The request is sent to the admin for review.
 *     tags:
 *       - Account Deletion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "No longer using the app"
 *     responses:
 *       201:
 *         description: Account deletion request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account deletion request submitted successfully. An admin will review it shortly.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: PENDING
 *       400:
 *         description: Failed to submit account deletion request
 */
router.post(
  "/account-deletion-requests",
  authMiddleware,
  requestAccountDeletionHandler
);

/**
 * @swagger
 * /api/account-deletion-requests/me:
 *   get:
 *     summary: Get my account deletion request
 *     description: Fetch the most recent account deletion request submitted by the authenticated user.
 *     tags:
 *       - Account Deletion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deletion request fetched successfully
 */
router.get(
  "/account-deletion-requests/me",
  authMiddleware,
  getMyAccountDeletionRequestHandler
);

/**
 * @swagger
 * /api/account-deletion-requests:
 *   get:
 *     summary: Get all account deletion requests
 *     description: Retrieve all account deletion requests, including the requesting user's details. Only accessible by superadmin.
 *     tags:
 *       - Account Deletion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deletion requests fetched successfully
 *       403:
 *         description: Forbidden. Superadmin access required.
 */
router.get(
  "/account-deletion-requests",
  authMiddleware,
  superadminMiddleware,
  getAllAccountDeletionRequestsHandler
);

/**
 * @swagger
 * /api/account-deletion-requests/trainers:
 *   get:
 *     summary: Get all Trainer account deletion requests
 *     description: Retrieve account deletion requests submitted only by Trainers. Only accessible by superadmin.
 *     tags:
 *       - Account Deletion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer account deletion requests fetched successfully
 *       403:
 *         description: Forbidden. Superadmin access required.
 */
router.get(
  "/account-deletion-requests/trainers",
  authMiddleware,
  superadminMiddleware,
  getTrainerAccountDeletionRequestsHandler
);

/**
 * @swagger
 * /api/account-deletion-requests/customers:
 *   get:
 *     summary: Get all Customer account deletion requests
 *     description: Retrieve account deletion requests submitted only by Customers. Only accessible by superadmin.
 *     tags:
 *       - Account Deletion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer account deletion requests fetched successfully
 *       403:
 *         description: Forbidden. Superadmin access required.
 */
router.get(
  "/account-deletion-requests/customers",
  authMiddleware,
  superadminMiddleware,
  getCustomerAccountDeletionRequestsHandler
);

/**
 * @swagger
 * /api/account-deletion-requests/{requestId}/status:
 *   patch:
 *     summary: Approve or reject an account deletion request
 *     description: Admin approves or rejects a pending account deletion request. If approved, the Trainer/Customer account and its related records are permanently deleted; the user must register again to use the app.
 *     tags:
 *       - Account Deletion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the account deletion request to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Account deletion request updated successfully
 *       400:
 *         description: Failed to update account deletion request
 *       403:
 *         description: Forbidden. Superadmin access required.
 */
router.patch(
  "/account-deletion-requests/:requestId/status",
  authMiddleware,
  superadminMiddleware,
  updateAccountDeletionRequestStatusHandler
);

export default router;
