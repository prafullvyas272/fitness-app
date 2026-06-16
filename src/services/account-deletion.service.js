import prisma from "../utils/prisma.js";
import RoleEnum from "../enums/RoleEnum.js";
import { deleteTrainer } from "./trainer.service.js";
import { deleteCustomer } from "./user.service.js";
import {
  sendAccountDeletionRequestNotification,
  sendAccountDeletionDecisionNotification,
} from "./notification.service.js";

/**
 * Create an account deletion request for the given Trainer/Customer.
 * The request is sent to SuperAdmin for review.
 */
export const requestAccountDeletion = async (userId, reason) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { name: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role.name === RoleEnum.SUPERADMIN) {
    throw new Error("SuperAdmin accounts cannot request deletion");
  }

  const existingPending = await prisma.accountDeletionRequest.findFirst({
    where: { userId, status: "PENDING" },
  });

  if (existingPending) {
    throw new Error("A pending account deletion request already exists");
  }

  const request = await prisma.accountDeletionRequest.create({
    data: {
      userId,
      reason,
      status: "PENDING",
    },
  });

  await sendAccountDeletionRequestNotification(request.id, user);

  return request;
};

/**
 * Fetch the most recent account deletion request submitted by a user.
 */
export const getMyAccountDeletionRequest = async (userId) => {
  return prisma.accountDeletionRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Fetch all account deletion requests (SuperAdmin only).
 */
export const getAllAccountDeletionRequests = async () => {
  try {
    return await prisma.accountDeletionRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    throw new Error("Failed to fetch account deletion requests: " + err.message);
  }
};

/**
 * Fetch account deletion requests submitted by users with the given role (SuperAdmin only).
 */
const getAccountDeletionRequestsByRole = async (roleName) => {
  try {
    return await prisma.accountDeletionRequest.findMany({
      where: {
        user: {
          role: { name: roleName },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    throw new Error(`Failed to fetch ${roleName} account deletion requests: ` + err.message);
  }
};

export const getTrainerAccountDeletionRequests = () =>
  getAccountDeletionRequestsByRole(RoleEnum.TRAINER);

export const getCustomerAccountDeletionRequests = () =>
  getAccountDeletionRequestsByRole(RoleEnum.CUSTOMER);

/**
 * Approve or reject an account deletion request.
 * On approval, the Trainer/Customer account (and its related records) is permanently deleted,
 * so the user must register again to use the app.
 */
export const updateAccountDeletionRequestStatus = async ({ requestId, status }) => {
  try {
    if (!["APPROVED", "REJECTED"].includes(status)) {
      throw new Error("Invalid status. Only APPROVED or REJECTED is allowed.");
    }

    const request = await prisma.accountDeletionRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    if (!request) {
      throw new Error("Account deletion request not found.");
    }

    if (!request.user) {
      throw new Error("The user for this request no longer exists.");
    }

    if (request.status !== "PENDING") {
      throw new Error("This request has already been processed.");
    }

    if (status === "REJECTED") {
      await prisma.accountDeletionRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      await sendAccountDeletionDecisionNotification(request.user, "REJECTED");

      return {
        updatedRequest: { ...request, status: "REJECTED" },
        deletedUser: null,
      };
    }

    // status === "APPROVED": delete the account. This also removes the
    // AccountDeletionRequest row itself, so we don't (and can't) update it afterwards.
    const roleName = request.user.role.name;
    let deletedUser;

    if (roleName === RoleEnum.TRAINER) {
      deletedUser = await deleteTrainer(request.userId);
    } else if (roleName === RoleEnum.CUSTOMER) {
      deletedUser = await deleteCustomer(request.userId);
    } else {
      throw new Error("SuperAdmin accounts cannot be deleted through this flow.");
    }

    return {
      updatedRequest: { ...request, status: "APPROVED" },
      deletedUser,
    };
  } catch (err) {
    throw new Error("Failed to update account deletion request: " + err.message);
  }
};
