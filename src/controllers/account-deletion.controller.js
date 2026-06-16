import {
  requestAccountDeletion,
  getMyAccountDeletionRequest,
  getAllAccountDeletionRequests,
  updateAccountDeletionRequestStatus,
} from "../services/account-deletion.service.js";

/**
 * Controller for a Trainer/Customer to request account deletion.
 * Expects userId in req.user (set by auth middleware). Accepts optional `reason` in req.body.
 */
export const requestAccountDeletionHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reason } = req.body;

    const request = await requestAccountDeletion(userId, reason);

    res.status(201).json({
      success: true,
      message: "Account deletion request submitted successfully. An admin will review it shortly.",
      data: request,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller for a Trainer/Customer to check the status of their own deletion request.
 */
export const getMyAccountDeletionRequestHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const request = await getMyAccountDeletionRequest(userId);

    res.status(200).json({
      success: true,
      message: "Account deletion request fetched successfully",
      data: request,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller for SuperAdmin to fetch all account deletion requests.
 */
export const getAllAccountDeletionRequestsHandler = async (req, res) => {
  try {
    const requests = await getAllAccountDeletionRequests();
    res.status(200).json({
      success: true,
      message: "Account deletion requests fetched successfully",
      data: requests,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Controller for SuperAdmin to approve/reject an account deletion request.
 * Expects requestId in req.params and status in req.body.
 */
export const updateAccountDeletionRequestStatusHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const result = await updateAccountDeletionRequestStatus({ requestId, status });

    res.status(200).json({
      success: true,
      message: `Account deletion request ${status?.toLowerCase()} successfully`,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
