import prisma from "../utils/prisma.js";
import { sendTrainerAssignedNotification } from "./notification.service.js";

export const getAllTrainerRequests = async () => {
  try {
    const trainerRequests = await prisma.trainerRequest.findMany({
      include: {
        customer: true,
        trainer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return trainerRequests;
  } catch (err) {
    throw new Error("Failed to fetch trainer requests: " + err.message);
  }
};

/**
 * Method to update trainer request
 * @param {*} param0 
 * @returns 
 */
export const updateTrainerRequestStatus = async ({ requestId, status }) => {
  try {
    // Validate status
    if (!["APPROVED", "REJECTED"].includes(status)) {
      throw new Error("Invalid status. Only APPROVED or REJECTED is allowed.");
    }

    // Find the trainer request
    const trainerRequest = await prisma.trainerRequest.findUnique({
      where: { id: requestId },
    });

    if (!trainerRequest) {
      throw new Error("Trainer request not found.");
    }

    // Update the status of the trainer request
    const updatedRequest = await prisma.trainerRequest.update({
      where: { id: requestId },
      data: {
        status,
      },
    });

    // If approved, create an AssignedCustomer entry
    let assignedCustomer = null;
    if (status === "APPROVED") {

      //step1
      const trainer = await prisma.user.findUnique({
        where: { id: trainerRequest.trainerId },
        select: { planId: true }
      });
      if (!trainer) {
        throw new Error("Trainer not found.");
      }

      if (!trainer.planId) {
        console.log("Trainer plan not assigned");
        // Optionally, you can choose to reject the request if the trainer doesn't have a plan assigned
        // throw new Error("Trainer does not have a plan assigned. Cannot approve request.");
      }
      // Check for existing assignment to avoid duplicates
      const existingAssignment = await prisma.assignedCustomer.findUnique({
        where: {
          customerId_trainerId: {
            customerId: trainerRequest.customerId,
            trainerId: trainerRequest.trainerId,
            isActive: true,
            startDate: new Date(),
          },
        },
      });

      if (!existingAssignment) {
        assignedCustomer = await prisma.assignedCustomer.create({
          data: {
            customerId: trainerRequest.customerId,
            trainerId: trainerRequest.trainerId,
            isActive: true,
            startDate: new Date(),
          },
        });

        // TODO: need to uncomment later
        
        // await sendTrainerAssignedNotification(trainerRequest.customerId, trainerRequest.trainerId);
      }
    }

    return {
      updatedRequest,
      assignedCustomer,
    };
  } catch (err) {
    throw new Error("Failed to update trainer request: " + err.message);
  }
};

// export const createTrainerRequest = async ({ customerId, trainerId }) => {
//   try {
//     // Check if a pending request already exists
//     const existingRequest = await prisma.trainerRequest.findFirst({
//       where: {
//         customerId,
//         trainerId,
//         status: "PENDING"
//       }
//     });

//     if (existingRequest) {
//       throw new Error("A pending request already exists for this customer and trainer.");
//     }

//     // Create the new trainer request
//     const newRequest = await prisma.trainerRequest.create({
//       data: {
//         customerId,
//         trainerId,
//         message,
//         status: "PENDING"
//       },
//     });

//     return newRequest;
//   } catch (err) {
//     throw new Error("Failed to create trainer request: " + err.message);
//   }
// };