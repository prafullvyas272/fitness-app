import prisma from "../utils/prisma.js";
import RoleEnum from "../enums/RoleEnum.js";

export const setUserSpecialities = async (user) => {
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