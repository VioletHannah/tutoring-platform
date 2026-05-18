const Joi = require('joi');

const createBookingSchema = Joi.object({
  teacherId: Joi.number().integer().required(),
  subject: Joi.string().min(1).max(100).required(),
  bookingDate: Joi.date().iso().required(),
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

const suggestScheduleSchema = Joi.object({
  teacherId: Joi.number().integer().required(),
  subject: Joi.string().min(1).max(100).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  durationMinutes: Joi.number().integer().min(1).required(),
  sessionsPerWeek: Joi.number().integer().min(1).required(),
  preferredWeekdays: Joi.array().items(Joi.number().integer().min(1).max(7)).min(1).required(),
  preferredTimeRanges: Joi.array().items(
    Joi.object({
      start: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
      end: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required()
    })
  ).min(1).required(),
  totalSessions: Joi.number().integer().min(1).optional(),
  location: Joi.string().max(255).optional(),
  note: Joi.string().max(1000).optional()
});

const confirmScheduleSchema = Joi.object({
  teacherId: Joi.number().integer().required(),
  subject: Joi.string().min(1).max(100).required(),
  scheduleItems: Joi.array().items(
    Joi.object({
      bookingDate: Joi.date().iso().required(),
      startTime: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required()
    })
  ).min(1).required(),
  location: Joi.string().max(255).optional(),
  note: Joi.string().max(1000).optional()
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
  getBookingsSchema,
  suggestScheduleSchema,
  confirmScheduleSchema
};
