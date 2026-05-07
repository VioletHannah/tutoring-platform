const { sendError } = require('../utils/response');

/**
 * Global error handling middleware
 * Must be defined after all routes
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Joi validation error
  if (err.isJoi) {
    return sendError(
      res,
      'Validation error',
      400,
      err.details.map(detail => detail.message)
    );
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return sendError(
      res,
      'Validation error',
      400,
      err.errors.map(e => e.message)
    );
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(
      res,
      'Duplicate entry',
      409,
      err.errors.map(e => e.message)
    );
  }

  // Multer file upload error
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File too large', 400);
    }
    return sendError(res, err.message, 400);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired token', 401);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  sendError(res, message, statusCode);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  sendError(res, `Route ${req.method} ${req.url} not found`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
