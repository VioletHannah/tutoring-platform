const { sendError } = require('../utils/response');

/**
 * Joi validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'query', 'params')
 * @returns {Function} Middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Validation error', 400, errors);
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

module.exports = {
  validate
};
