import prisma from "../utils/prisma.js";
import RoleEnum from "../enums/RoleEnum.js";

export const sendRegistrationNotification = async (user) => {
  try {
    // Find all SuperAdmin users to notify
    const superAdmins = await prisma.user.findMany({
      where: {
        role: {
          name: RoleEnum.SUPERADMIN
        },
        fcmToken: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        fcmToken: true
      }
    });

    if (!superAdmins || superAdmins.length === 0) {
      throw new Error("No SuperAdmin users found with FCM tokens");
    }

    // Compose notification for each admin
    const notificationPromises = superAdmins.map(async (adminUser) => {
      // Compose the message
      const message = {
        token: adminUser.fcmToken,
        data: {
          type: "USER_REGISTRATION",
          userId: user.id,
          userEmail: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          message: "A new user has registered and is awaiting approval."
        },
        android: {
          priority: "high"
        },
        apns: {
          payload: {
            aps: {
              sound: "default"
            }
          }
        }
      };

      // Dynamically import firebase admin SDK since only allowed in service layer
      const { default: admin } = await import("../config/firebase.js");
      return admin.messaging().send(message);
    });

    // Await all notifications (can also use Promise.allSettled for robustness)
    await Promise.all(notificationPromises);

    return true;
  } catch (error) {
    throw new Error(`Failed to notify SuperAdmin(s): ${error.message}`);
  }
};


/**
 * Send a TRAINER_REQUEST notification to all SuperAdmins and create Notification DB entry.
 * @param {string} trainerRequestId - The ID of the TrainerRequest triggering this notification.
 * @param {object} trainerRequestData - { customerId, trainerId, message }
 * @returns {boolean} true if sent, throws otherwise.
 */
export const sendTrainerRequestNotification = async (trainerRequestId, trainerRequestData) => {
  try {

    // Get RoleEnum.SUPERADMIN's roleId
    const superAdminRole = await prisma.role.findUnique({
      where: { name: RoleEnum.SUPERADMIN },
      select: { id: true }
    });

    if (!superAdminRole) {
      throw new Error("SuperAdmin role not found");
    }

    const superAdminRoleId = superAdminRole.id;
    console.log(superAdminRoleId)
    // 1. Find all superadmins with an fcmToken
    const superAdmins = await prisma.user.findMany({
      where: {
        roleId: superAdminRoleId,
        isActive: true,
        NOT: { fcmToken: null }
      },
      select: {
        id: true,
        email: true,
        fcmToken: true
      }
    });

    if (!superAdmins || superAdmins.length === 0) {
      throw new Error("No SuperAdmin users found with FCM tokens");
    }

    // 2. Compose notification message
    const { customerId, trainerId, message } = trainerRequestData;

    const [customer, trainer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: customerId },
        select: { firstName: true, lastName: true }
      }),
      prisma.user.findUnique({
        where: { id: trainerId },
        select: { firstName: true, lastName: true }
      })
    ]);

    const notifTitle = "New Trainer Request";
    const notifMsg = `A new trainer request from ${customer?.firstName || "Customer"} ${customer?.lastName || ""} to ${trainer?.firstName || "Trainer"} ${trainer?.lastName || ""}. ${message ? "Message: " + message : ""}`;

    // 3. For each superadmin, send FCM notification and create Notification DB entry
    const sendAndSavePromises = superAdmins.map(async (adminUser) => {
      // Send FCM notification
      const fcmMessage = {
        token: adminUser.fcmToken,
        data: {
          type: "TRAINER_REQUEST",
          trainerRequestId,
          customerId,
          trainerId,
          message: notifMsg
        },
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } }
      };
      const { default: admin } = await import("../config/firebase.js");
      await admin.messaging().send(fcmMessage);

      // Create Notification DB entry
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: notifTitle,
          message: notifMsg,
          type: "TRAINER_REQUEST"
        }
      });
    });

    await Promise.all(sendAndSavePromises);
    return true;
  } catch (error) {
    throw new Error(`Failed to send trainer request notification: ${error.message}`);
  }
};