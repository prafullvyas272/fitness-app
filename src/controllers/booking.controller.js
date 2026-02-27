import { BookingStatus } from "../constants/constants.js";
import { getBookingsByTrainerWithPagination, bookSlot, markAsAttended, cancelBookingById, rescheduleBooking, getBookingDetailsById, updateBookingAccolades } from "../services/booking.service.js";

/**
 * Extracts trainerId from params and pagination from query, calls service, and returns response.
 */
export const getBookingsByTrainerHandler = async (req, res) => {
  try {
    const { trainerId, date } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const result = await getBookingsByTrainerWithPagination(
      trainerId,
      date,
      Number(page),
      Number(pageSize)
    );

    // Transform userProfileDetails from array to object for customer and trainer per booking
    const formattedBookings = result.bookings.map((booking) => {
      let formattedCustomer = { ...booking.customer };
      let formattedTrainer = { ...booking.trainer };

      if (
        Array.isArray(formattedCustomer.userProfileDetails) &&
        formattedCustomer.userProfileDetails.length > 0
      ) {
        formattedCustomer.userProfileDetails = formattedCustomer.userProfileDetails[0];
      } else {
        formattedCustomer.userProfileDetails = null;
      }

      if (
        Array.isArray(formattedTrainer.userProfileDetails) &&
        formattedTrainer.userProfileDetails.length > 0
      ) {
        formattedTrainer.userProfileDetails = formattedTrainer.userProfileDetails[0];
      } else {
        formattedTrainer.userProfileDetails = null;
      }

      return {
        ...booking,
        customer: formattedCustomer,
        trainer: formattedTrainer,
      };
    });

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: {
        ...result,
        bookings: formattedBookings,
      }
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
    const { bookingStatus } = req.body;

    if (!bookingId || typeof bookingStatus === "undefined") {
      return res.status(400).json({
        success: false,
        message: "bookingId and bookingStatus are required"
      });
    }

    const booking = await markAsAttended(bookingId, bookingStatus);

    res.status(200).json({
      success: true,
      message: bookingStatus === BookingStatus.ATTENDED ? "Booking marked as attended" : "Booking marked as not attended",
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

/**
 * Controller: rescheduleBookingHandler
 * Reschedules a booking to a new time slot.
 */
export const rescheduleBookingHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newTimeSlotId } = req.body;

    if (!bookingId || !newTimeSlotId) {
      return res.status(400).json({
        success: false,
        message: "bookingId and newTimeSlotId are required"
      });
    }

    const updatedBooking = await rescheduleBooking(bookingId, newTimeSlotId);

    res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully",
      data: updatedBooking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/**
 * Controller: getBookingDetailsByIdHandler
 * Returns booking details (including customer, trainer, and timeSlot) by bookingId
 */
export const getBookingDetailsByIdHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    const bookingDetails = await getBookingDetailsById(bookingId);
    res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      data: bookingDetails
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Controller: updateBookingAccoladesHandler
 * Updates the accolades array for a booking
 */
export const updateBookingAccoladesHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { accolades } = req.body;

    if (!bookingId || !Array.isArray(accolades)) {
      return res.status(400).json({
        success: false,
        message: "bookingId and accolades (as array) are required"
      });
    }

    const updatedBooking = await updateBookingAccolades(bookingId, accolades);

    res.status(200).json({
      success: true,
      message: "Booking accolades updated successfully",
      data: updatedBooking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
