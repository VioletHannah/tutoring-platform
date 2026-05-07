const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { validate } = require('../middlewares/validator');
const {
  createBookingSchema,
  updateBookingStatusSchema,
  getBookingsSchema
} = require('../validators/bookingValidator');

// All booking routes require authentication
router.use(authenticate);

// Create booking (students only)
router.post(
  '/',
  authorize('student'),
  validate(createBookingSchema),
  bookingController.createBooking
);

// Get my bookings
router.get(
  '/',
  validate(getBookingsSchema, 'query'),
  bookingController.getMyBookings
);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Teacher actions
router.put(
  '/:id/accept',
  authorize('teacher'),
  bookingController.acceptBooking
);

router.put(
  '/:id/reject',
  authorize('teacher'),
  bookingController.rejectBooking
);

router.put(
  '/:id/complete',
  authorize('teacher'),
  bookingController.completeBooking
);

// Cancel booking (student or teacher)
router.put(
  '/:id/cancel',
  authorize('student', 'teacher'),
  bookingController.cancelBooking
);

module.exports = router;
