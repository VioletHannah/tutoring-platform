const Joi = require('joi');

const createBookingSchema = Joi.object({
  teacherId: Joi.number().integer().required(),
  subject: Joi.string().min(1).max(100).required(),
  bookingDate: Joi.date().iso().min('now').required(),
  startTime: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  location: Joi.string().max(255).optional(),
  note: Joi.string().max(1000).optional()
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected', 'completed', 'cancelled').required(),
  teacherReply: Joi.string().max(1000).optional()
});

const getBookingsSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected', 'completed', 'cancelled').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
  getBookingsSchema
};
