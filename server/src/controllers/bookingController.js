const { Op } = require('sequelize');
const { Booking, User, TeacherProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { sequelize } = require('../config/database');

/**
 * Create a new booking
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const studentId = req.user.userId;
    const { teacherId, subject, bookingDate, startTime, endTime, location, note } = req.body;

    // Check if user is a student
    if (req.user.role !== 'student') {
      await transaction.rollback();
      return sendError(res, 'Only students can create bookings', 403);
    }

    // Check if teacher exists and is active
    const teacher = await User.findOne({
      where: { id: teacherId, role: 'teacher', status: 'active' }
    });

    if (!teacher) {
      await transaction.rollback();
      return sendError(res, 'Teacher not found or not active', 404);
    }

    // Check for time conflicts
    const conflictingBooking = await Booking.findOne({
      where: {
        teacherId,
        bookingDate,
        status: { [Op.in]: ['pending', 'accepted'] },
        [Op.or]: [
          {
            startTime: { [Op.lte]: startTime },
            endTime: { [Op.gt]: startTime }
          },
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gte]: endTime }
          },
          {
            startTime: { [Op.gte]: startTime },
            endTime: { [Op.lte]: endTime }
          }
        ]
      }
    });

    if (conflictingBooking) {
      await transaction.rollback();
      return sendError(res, 'Teacher is not available at this time', 409);
    }

    // Get teacher's hourly rate
    const teacherProfile = await TeacherProfile.findOne({
      where: { userId: teacherId }
    });

    // Calculate total amount (simple calculation based on hourly rate)
    let totalAmount = null;
    if (teacherProfile && teacherProfile.hourlyRate) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      totalAmount = hours * teacherProfile.hourlyRate;
    }

    // Create booking
    const booking = await Booking.create({
      studentId,
      teacherId,
      subject,
      bookingDate,
      startTime,
      endTime,
      location,
      note,
      totalAmount,
      status: 'pending'
    }, { transaction });

    await transaction.commit();

    // Fetch complete booking with relations
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    sendSuccess(res, completeBooking, 'Booking created successfully', 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get bookings for current user
 * GET /api/bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build where clause
    const where = {};

    // Filter by user role
    if (req.user.role === 'student') {
      where.studentId = userId;
    } else if (req.user.role === 'teacher') {
      where.teacherId = userId;
    } else {
      return sendError(res, 'Invalid user role', 403);
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate[Op.gte] = startDate;
      if (endDate) where.bookingDate[Op.lte] = endDate;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch bookings
    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['bookingDate', 'DESC'], ['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    sendSuccess(res, {
      bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }, 'Bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Check if user has permission to view this booking
    if (booking.studentId !== userId && booking.teacherId !== userId && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    sendSuccess(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Accept booking (teacher only)
 * PUT /api/bookings/:id/accept
 */
const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;
    const { teacherReply } = req.body;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return sendError(res, 'Only teachers can accept bookings', 403);
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Check if booking belongs to this teacher
    if (booking.teacherId !== teacherId) {
      return sendError(res, 'Access denied', 403);
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return sendError(res, 'Booking is not pending', 400);
    }

    // Update booking status
    await booking.update({
      status: 'accepted',
      teacherReply
    });

    sendSuccess(res, booking, 'Booking accepted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Reject booking (teacher only)
 * PUT /api/bookings/:id/reject
 */
const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;
    const { teacherReply } = req.body;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return sendError(res, 'Only teachers can reject bookings', 403);
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Check if booking belongs to this teacher
    if (booking.teacherId !== teacherId) {
      return sendError(res, 'Access denied', 403);
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return sendError(res, 'Booking is not pending', 400);
    }

    // Update booking status
    await booking.update({
      status: 'rejected',
      teacherReply
    });

    sendSuccess(res, booking, 'Booking rejected');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 * PUT /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Check permission
    if (booking.studentId !== userId && booking.teacherId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return sendError(res, `Booking is already ${booking.status}`, 400);
    }

    // Update booking status
    await booking.update({ status: 'cancelled' });

    sendSuccess(res, booking, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark booking as completed (teacher only)
 * PUT /api/bookings/:id/complete
 */
const completeBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return sendError(res, 'Only teachers can complete bookings', 403);
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Check if booking belongs to this teacher
    if (booking.teacherId !== teacherId) {
      return sendError(res, 'Access denied', 403);
    }

    // Check if booking is accepted
    if (booking.status !== 'accepted') {
      return sendError(res, 'Only accepted bookings can be marked as completed', 400);
    }

    // Update booking status
    await booking.update({ status: 'completed' });

    sendSuccess(res, booking, 'Booking marked as completed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking
};
