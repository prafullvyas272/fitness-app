import prisma from "../utils/prisma.js";
import RoleEnum from "../enums/RoleEnum.js";
// import NotificationTypeEnum from "../enums/RoleEnum.js";

import { default as admin } from "../config/firebase.js";

/**
 * Send a registration notification to all SuperAdmin devices (across all devices per user).
 * @param {object} user - { id, email, firstName, lastName }
 * @returns {boolean}
 */
export const sendRegistrationNotification = async (user) => {
  try {
    // 1. Get SuperAdmin Role ID
    const superAdminRole = await prisma.role.findUnique({
      where: { name: RoleEnum.SUPERADMIN },
      select: { id: true }
    });

    if (!superAdminRole) {
      throw new Error("SuperAdmin role not found");
    }

    // 2. Find all active SuperAdmins
    const superAdmins = await prisma.user.findMany({
      where: {
        roleId: superAdminRole.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
      }
    });

    if (!superAdmins || superAdmins.length === 0) {
      throw new Error("No SuperAdmin users found");
    }

    // 3. For each SuperAdmin, get their devices with FCM tokens
    const devicePromises = superAdmins.map(async (adminUser) => {
      const devices = await prisma.userDevice.findMany({
        where: {
          userId: adminUser.id, },
          select: { fcmToken: true }
      });
      return {
        adminUser,
        deviceTokens: devices.map(d => d.fcmToken).filter(Boolean)
      };
    });

    const adminDeviceList = await Promise.all(devicePromises);

    // Compose notification message for each device of each admin
    const messagePromises = [];
    for (const { adminUser, deviceTokens } of adminDeviceList) {
      for (const token of deviceTokens) {
        const message = {
          token,
          data: {
            type: "USER_REGISTRATION",
            userId: user.id,
            userEmail: user.email || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            message: "A new user has registered and is awaiting approval."
          },
          android: { priority: "high" },
          apns: { payload: { aps: { sound: "default" } } }
        };
        messagePromises.push(
          (async () => {
            const { default: admin } = await import("../config/firebase.js");
            return admin.messaging().send(message);
          })()
        );
      }
    }

    if (messagePromises.length === 0) {
      throw new Error("No SuperAdmin devices found with FCM tokens");
    }

    // Wait for all messages to be sent
    await Promise.all(messagePromises);

    return true;
  } catch (error) {
    throw new Error(`Failed to notify SuperAdmin(s): ${error.message}`);
  }
};


/**
 * Send a TRAINER_REQUEST notification to all SuperAdmin devices and create Notification DB entry.
 * @param {string} trainerRequestId - The ID of the TrainerRequest triggering this notification.
 * @param {object} trainerRequestData - { customerId, trainerId, message }
 * @returns {boolean} true if sent, throws otherwise.
 */
export const sendTrainerRequestNotification = async (trainerRequestId, trainerRequestData) => {
  try {
    // Get SuperAdmin Role ID
    const superAdminRole = await prisma.role.findUnique({
      where: { name: RoleEnum.SUPERADMIN },
      select: { id: true }
    });

    if (!superAdminRole) {
      throw new Error("SuperAdmin role not found");
    }

    // Find all active superadmins
    const superAdmins = await prisma.user.findMany({
      where: {
        roleId: superAdminRole.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
      }
    });

    if (!superAdmins || superAdmins.length === 0) {
      throw new Error("No SuperAdmin users found");
    }

    // For each superadmin, get all their device tokens
    const devicePromises = superAdmins.map(async (adminUser) => {
      const devices = await prisma.userDevice.findMany({
  where: {
    userId: adminUser.id,
  },
  select: { fcmToken: true }
});
      return {
        adminUser,
        deviceTokens: devices.map(d => d.fcmToken).filter(Boolean)
      };
    });

    const adminDeviceList = await Promise.all(devicePromises);

    // Compose notification message data
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

    // For each superadmin/user, send to each device and ALSO create one DB notification per user (not per device)
    const sendPushPromises = [];
    const createDbNotifyPromises = [];

    for (const { adminUser, deviceTokens } of adminDeviceList) {
      // Send to all devices for this adminUser
      for (const token of deviceTokens) {
        const fcmMessage = {
          token,
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
        sendPushPromises.push(
          (async () => {
            const { default: admin } = await import("../config/firebase.js");
            return admin.messaging().send(fcmMessage);
          })()
        );
      }
      // Create only one notification db entry per user
      createDbNotifyPromises.push(
        prisma.notification.create({
          data: {
            userId: adminUser.id,
            title: notifTitle,
            message: notifMsg,
            type: "TRAINER_REQUEST"
          }
        })
      );
    }

    if (sendPushPromises.length === 0) {
      throw new Error("No SuperAdmin devices found with FCM tokens");
    }

    // Wait for all push notifications to be sent and DB notifications to be created
    await Promise.all([
      Promise.all(sendPushPromises),
      Promise.all(createDbNotifyPromises)
    ]);

    return true;
  } catch (error) {
    throw new Error(`Failed to send trainer request notification: ${error.message}`);
  }
};


export const sendTrainerAssignedNotification = async (customerId, trainerId) => {
  try {

    // Fetch customer and trainer details from the database
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true, firstName: true, lastName: true }
    });
    if (!customer) {
      throw new Error("Customer not found");
    }

    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { id: true, firstName: true, lastName: true }
    });
    if (!trainer) {
      throw new Error("Trainer not found");
    }

    
    const [trainerDevices, customerDevices] = await Promise.all([
      prisma.userDevice.findMany({
        where: { userId: trainer.id }
      }),
      prisma.userDevice.findMany({
        where: { userId: customer.id }
      })
    ]);

    const sendPushPromises = [];
    const createDbNotifyPromises = [];

    // Trainer notification
    const trainerNotifTitle = "New Customer Assigned";
    const trainerNotifMsg = `You have been assigned to customer ${customer.firstName} ${customer.lastName}`;

    // Always save DB notification for trainer
    createDbNotifyPromises.push(
      prisma.notification.create({
        data: { userId: trainer.id, title: trainerNotifTitle, message: trainerNotifMsg, type: "TRAINER_ASSIGNED" }
      })
    );
    // Push only if trainer has devices
    for (const device of trainerDevices) {
      sendPushPromises.push(admin.messaging().send({
        token: device.fcmToken,
        data: { type: "TRAINER_ASSIGNED", trainerId: trainer.id, customerId: customer.id, message: trainerNotifMsg },
        notification: { title: trainerNotifTitle, body: trainerNotifMsg },
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } }
      }));
    }

    // Customer notification
    const customerNotifTitle = "Trainer Assigned";
    const customerNotifMsg = `Trainer ${trainer.firstName} ${trainer.lastName} has been assigned to you`;

    // Always save DB notification for customer
    createDbNotifyPromises.push(
      prisma.notification.create({
        data: { userId: customer.id, title: customerNotifTitle, message: customerNotifMsg, type: "TRAINER_ASSIGNED" }
      })
    );
    // Push only if customer has devices
    for (const device of customerDevices) {
      sendPushPromises.push(admin.messaging().send({
        token: device.fcmToken,
        data: { type: "TRAINER_ASSIGNED", trainerId: trainer.id, customerId: customer.id, message: customerNotifMsg },
        notification: { title: customerNotifTitle, body: customerNotifMsg },
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } }
      }));
    }

    // Always save DB notifications; push is best-effort
    await Promise.all(createDbNotifyPromises);
    if (sendPushPromises.length > 0) {
      await Promise.allSettled(sendPushPromises);
    }

    return true;
  } catch (error) {
    throw new Error(`Failed to send trainer assigned notification: ${error.message}`);
  }
};

export const sendChatNotification = async ({
  recieverId,
  senderId,
  conversationId,
  chatMessageId,
  message,
}) => {
  try {

    const devices = await prisma.userDevice.findMany({
      where: { userId: recieverId }
    });


    const tokens = devices.map(d => d.fcmToken).filter(Boolean);
    console.log(tokens, recieverId)

    if (!tokens.length) return;

    const payload = {
      notification: {
        title: "New Message",
        body: message
      },
      data: {
        type: "CHAT",
        userId: String(recieverId),
        senderId: String(senderId),
        conversationId: String(conversationId),
        chatMessageId: String(chatMessageId)
      },
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } }
    };

    await admin.messaging().sendEachForMulticast({
      tokens,
      ...payload
    });

  } catch (err) {
    console.error("FCM Error:", err);
  }
};


/**
 * Notify all SuperAdmins that a Trainer/Customer has requested account deletion.
 * @param {string} requestId - The ID of the AccountDeletionRequest triggering this notification.
 * @param {object} requestUser - { id, firstName, lastName, email }
 * @returns {boolean} true if processed (push delivery is best-effort).
 */
export const sendAccountDeletionRequestNotification = async (requestId, requestUser) => {
  try {
    const superAdminRole = await prisma.role.findUnique({
      where: { name: RoleEnum.SUPERADMIN },
      select: { id: true }
    });

    if (!superAdminRole) {
      throw new Error("SuperAdmin role not found");
    }

    const superAdmins = await prisma.user.findMany({
      where: {
        roleId: superAdminRole.id,
        isActive: true,
      },
      select: { id: true, email: true }
    });

    if (!superAdmins || superAdmins.length === 0) {
      return false;
    }

    const notifTitle = "New Account Deletion Request";
    const notifMsg = `${requestUser.firstName || "A user"} ${requestUser.lastName || ""} (${requestUser.email}) has requested account deletion.`;

    const sendPushPromises = [];
    const createDbNotifyPromises = [];

    for (const adminUser of superAdmins) {
      createDbNotifyPromises.push(
        prisma.notification.create({
          data: {
            userId: adminUser.id,
            title: notifTitle,
            message: notifMsg,
            type: "ACCOUNT_DELETION_REQUEST"
          }
        })
      );

      const devices = await prisma.userDevice.findMany({
        where: { userId: adminUser.id },
        select: { fcmToken: true }
      });

      for (const token of devices.map(d => d.fcmToken).filter(Boolean)) {
        sendPushPromises.push(
          admin.messaging().send({
            token,
            notification: { title: notifTitle, body: notifMsg },
            data: {
              type: "ACCOUNT_DELETION_REQUEST",
              requestId,
              userId: requestUser.id,
            },
            android: { priority: "high" },
            apns: { payload: { aps: { sound: "default" } } }
          })
        );
      }
    }

    // DB notifications must succeed; push delivery is best-effort.
    await Promise.all(createDbNotifyPromises);
    if (sendPushPromises.length > 0) {
      await Promise.allSettled(sendPushPromises);
    }

    return true;
  } catch (error) {
    throw new Error(`Failed to send account deletion request notification: ${error.message}`);
  }
};

/**
 * Notify a user about the decision (e.g. rejection) made on their account deletion request.
 * Not used for APPROVED, since the account no longer exists once approved.
 * @param {object} user - { id, firstName, lastName, email }
 * @param {string} status - "REJECTED"
 */
export const sendAccountDeletionDecisionNotification = async (user, status) => {
  try {
    const title = "Account Deletion Request Rejected";
    const message = "Your account deletion request has been reviewed and rejected by the admin. Your account remains active.";

    await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        message,
        type: "ACCOUNT_DELETION_REQUEST"
      }
    });

    const devices = await prisma.userDevice.findMany({ where: { userId: user.id } });
    const tokens = devices.map(d => d.fcmToken).filter(Boolean);

    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body: message },
        data: { type: "ACCOUNT_DELETION_REQUEST", userId: user.id },
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } }
      });
    }
  } catch (error) {
    // Notification failure should never block the admin's decision from being saved.
    console.error("Failed to send account deletion decision notification:", error.message);
  }
};

export const createReminderNotification = async ({
  userId,
  title,
  message,
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: "REMINDER",
      },
    });

   const devices = await prisma.userDevice.findMany({
  where: {
    userId,
  },
});

    const tokens = devices
  .map(d => d.fcmToken)
  .filter(token => token);

    if (!tokens.length) return notification;

    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        type: "REMINDER",
        notificationId: String(notification.id),
      },
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    };

    await admin.messaging().sendEachForMulticast({
      tokens,
      ...payload,
    });

    return notification;
  } catch (error) {
    throw new Error(`Failed to send reminder notification: ${error.message}`);
  }
};