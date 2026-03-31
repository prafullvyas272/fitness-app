import { getAllTrainerRequests, updateTrainerRequestStatus } from "../services/trainer-request.service.js";

export const getAllTrainerRequestsHandler = async (req, res) => {
  try {
    const trainerRequests = await getAllTrainerRequests();
    res.status(200).json({
      success: true,
      message: "Trainer requests fetched successfully",
      data: trainerRequests
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/**
 * Controller to update the status of a trainer request.
 * Expects requestId in req.params and status in req.body.
 */
export const updateTrainerRequestStatusHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const result = await updateTrainerRequestStatus({ requestId, status });

    res.status(200).json({
      success: true,
      message: `Trainer request status updated successfully`,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// export const createTrainerRequestHandler = async (req, res) => {
//   try {
//     const customerId = req.user.userId; // Assuming authenticated user is the customer
//     const { trainerId, message } = req.body;
    
//     if (!trainerId) {
//       return res.status(400).json({
//         success: false,
//         message: "Trainer ID is required"
//       });
//     }

//     const request = await createTrainerRequest({ customerId, trainerId, message });
    
//     res.status(201).json({
//       success: true,
//       message: "Trainer request created successfully",
//       data: request
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       message: err.message
//     });
//   }
// };