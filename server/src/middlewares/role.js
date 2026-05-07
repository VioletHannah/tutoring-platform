const { sendError } = require('../utils/response');

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Check if user is the owner of the resource
 * @param {string} paramName - Name of the URL parameter containing the user ID
 * @returns {Function} Middleware function
 */
const authorizeOwner = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const resourceUserId = parseInt(req.params[paramName]);

    if (req.user.userId !== resourceUserId && req.user.role !== 'admin') {
      return sendError(res, 'Access denied. You can only access your own resources', 403);
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeOwner
};
