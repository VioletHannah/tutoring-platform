const Joi = require('joi');

const createTeacherProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  age: Joi.number().integer().min(18).max(100).optional(),
  education: Joi.string().max(100).optional(),
  teachingExperience: Joi.number().integer().min(0).optional(),
  hourlyRate: Joi.number().min(0).precision(2).optional(),
  subjects: Joi.array().items(Joi.string()).optional(),
  introduction: Joi.string().max(2000).optional(),
  availableTimes: Joi.array().items(Joi.object({
    day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    slots: Joi.array().items(Joi.object({
      start: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
    }))
  })).optional()
});

const updateTeacherProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  age: Joi.number().integer().min(18).max(100).optional(),
  education: Joi.string().max(100).optional(),
  teachingExperience: Joi.number().integer().min(0).optional(),
  hourlyRate: Joi.number().min(0).precision(2).optional(),
  subjects: Joi.array().items(Joi.string()).optional(),
  introduction: Joi.string().max(2000).optional(),
  availableTimes: Joi.array().items(Joi.object({
    day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    slots: Joi.array().items(Joi.object({
      start: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
    }))
  })).optional(),
  isOnline: Joi.boolean().optional()
});

const searchTeachersSchema = Joi.object({
  subject: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  minExperience: Joi.number().integer().min(0).optional(),
  education: Joi.string().optional(),
  sortBy: Joi.string().valid('rating', 'hourlyRate', 'teachingExperience').optional(),
  order: Joi.string().valid('ASC', 'DESC').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  createTeacherProfileSchema,
  updateTeacherProfileSchema,
  searchTeachersSchema
};
