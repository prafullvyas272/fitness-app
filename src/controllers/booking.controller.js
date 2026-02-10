import { getBookingsByTrainerWithPagination, bookSlot, markAsAttended, cancelBookingById } from "../services/booking.service.js";

/**
 * Extracts trainerId from params and pagination from query, calls service, and returns response.
 */
export const getBookingsByTrainerHandler = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const result = await getBookingsByTrainerWithPagination(
      trainerId,
      Number(page),
      Number(pageSize)
    );

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Controller: bookSlotHandler
 * Extracts customerId from req.user, trainerId from params, and timeSlotId from body, calls service, and returns response.
 */
export const bookSlotHandler = async (req, res) => {
  try {
    const customerId = req.user?.userId;
    const { trainerId } = req.params;
    const { timeSlotId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user required"
      });
    }

    if (!trainerId || !timeSlotId) {
      return res.status(400).json({
        success: false,
        message: "trainerId and timeSlotId are required"
      });
    }

    const booking = await bookSlot(customerId, trainerId, timeSlotId);

    res.status(201).json({
      success: true,
      message: "Slot booked successfully",
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/**
 * Controller: markAsAttendedHandler
 */
export const markAsAttendedHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { isAttended } = req.body;

    if (!bookingId || typeof isAttended === "undefined") {
      return res.status(400).json({
        success: false,
        message: "bookingId and isAttended are required"
      });
    }

    const booking = await markAsAttended(bookingId, isAttended);

    res.status(200).json({
      success: true,
      message: isAttended ? "Booking marked as attended" : "Booking marked as not attended",
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/**
 * Controller: cancelBookingByIdHandler
 * Cancels a booking by its ID.
 */
export const cancelBookingByIdHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    const cancelledBooking = await cancelBookingById(bookingId);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: cancelledBooking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


