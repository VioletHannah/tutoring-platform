const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const { User } = require('../models');

/**
 * Authentication middleware - Verify JWT token
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.status !== 'active') {
      return sendError(res, 'Account is not active', 403);
    }

    // Attach user to request object
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

/**
 * Optional authentication - Attach user if token is provided
 * Does not block request if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId);

      if (user && user.status === 'active') {
        req.user = {
          userId: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status
        };
      }
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
