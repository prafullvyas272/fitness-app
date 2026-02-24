import express from "express";
import {
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  showCustomerProfileDataHandler,
} from "../controllers/customer.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superadminMiddleware } from "../middlewares/superadmin.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer user
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Customer created successfully.
 *       400:
 *         description: Error occurred.
 */
router.post(
  "/api/customers",
  authMiddleware,
  superadminMiddleware,
  upload.single("avatar"),
  createCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update an existing customer user
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Customer updated successfully.
 *       400:
 *         description: Error occurred.
 */
router.put(
  "/api/customers/:id",
  authMiddleware,
  superadminMiddleware,
  upload.single("avatar"),
  updateCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer user
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to delete
 *     responses:
 *       200:
 *         description: Customer deleted successfully.
 *       400:
 *         description: Error occurred.
 */
router.delete(
  "/api/customers/:id",
  authMiddleware,
  superadminMiddleware,
  deleteCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}/profile:
 *   get:
 *     summary: Get a customer's profile data
 *     tags:
 *       - Superadmin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer
 *     responses:
 *       200:
 *         description: Customer profile data fetched successfully.
 *       400:
 *         description: Error occurred.
 */
router.get(
  "/api/customers/:id/profile",
  authMiddleware,
  showCustomerProfileDataHandler
);

export default router;
