const Joi = require('joi');

const materialTypes = ['certificate', 'education', 'experience', 'self_intro', 'other'];

const uploadMaterialSchema = Joi.object({
  materialType: Joi.string()
    .valid(...materialTypes)
    .required()
    .messages({
      'any.required': '材料类型不能为空',
      'any.only': '材料类型不支持'
    }),
  title: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': '材料标题不能为空',
      'string.min': '材料标题不能少于2个字符',
      'string.max': '材料标题不能超过100个字符'
    })
});

const reviewAgainSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': '材料ID不能为空',
      'number.positive': '材料ID必须是正整数'
    })
});

const getPendingSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  uploadMaterialSchema,
  reviewAgainSchema,
  getPendingSchema,
  materialTypes
};