const { User, TeacherProfile, StudentProfile, Institution } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      phone,
      passwordHash,
      role,
      status: role === 'admin' ? 'active' : 'pending'
    });

    // Create role-specific profile
    if (role === 'teacher') {
      await TeacherProfile.create({
        userId: user.id,
        fullName: username
      });
    } else if (role === 'student') {
      await StudentProfile.create({
        userId: user.id,
        fullName: username
      });
    } else if (role === 'institution') {
      await Institution.create({
        userId: user.id,
        institutionName: username
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status
        },
        token
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check if account is active
    if (user.status !== 'active' && user.status !== 'pending') {
      return sendError(res, 'Account is inactive', 403);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    sendSuccess(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'email', 'phone', 'role', 'status', 'createdAt'],
      include: [
        {
          model: TeacherProfile,
          as: 'teacherProfile',
          required: false
        },
        {
          model: StudentProfile,
          as: 'studentProfile',
          required: false
        },
        {
          model: Institution,
          as: 'institution',
          required: false
        }
      ]
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, user, 'User info retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);

    if (!isPasswordValid) {
      return sendError(res, 'Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await user.update({ passwordHash: newPasswordHash });

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout (client-side token removal)
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  sendSuccess(res, null, 'Logout successful');
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  logout
};
