const { Op } = require('sequelize');
const { User, TeacherProfile, Booking } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

const getTeacherReviewStats = async (teacherId) => {
  const reviewRows = await Booking.findAll({
    where: {
      teacherId,
      studentRating: { [Op.ne]: null }
    },
    attributes: ['studentRating'],
    raw: true
  });

  const totalReviews = reviewRows.length;
  if (totalReviews === 0) {
    return { rating: 0, totalReviews: 0 };
  }

  const totalRating = reviewRows.reduce(
    (sum, row) => sum + Number(row.studentRating || 0),
    0
  );

  return {
    rating: Math.round((totalRating / totalReviews) * 100) / 100,
    totalReviews
  };
};

const attachLiveReviewStats = async (profile) => {
  const data = profile.toJSON();
  const reviewStats = await getTeacherReviewStats(data.userId);
  return {
    ...data,
    ...reviewStats
  };
};

/**
 * Create or update teacher profile
 * POST/PUT /api/teachers/profile
 */
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return sendError(res, 'Only teachers can create profiles', 403);
    }

    const profileData = req.body;

    // Check if profile exists
    let profile = await TeacherProfile.findOne({ where: { userId } });

    if (profile) {
      // Update existing profile
      await profile.update(profileData);
      sendSuccess(res, profile, 'Teacher profile updated successfully');
    } else {
      // Create new profile
      profile = await TeacherProfile.create({
        ...profileData,
        userId
      });
      sendSuccess(res, profile, 'Teacher profile created successfully', 201);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher profile for current user
 * GET /api/teachers/my-profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const includeUser = [{
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'email', 'phone', 'status']
    }];

    let profile = await TeacherProfile.findOne({
      where: { userId },
      include: includeUser
    });

    if (!profile) {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'phone', 'status']
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      await TeacherProfile.create({
        userId,
        fullName: user.username
      });

      profile = await TeacherProfile.findOne({
        where: { userId },
        include: includeUser
      });
    }

    sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher by ID (public)
 * GET /api/teachers/:id
 */
const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await TeacherProfile.findOne({
      where: { userId: id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'status'],
        where: { status: 'active' }
      }]
    });

    if (!profile) {
      return sendError(res, 'Teacher not found', 404);
    }

    const profileWithReviewStats = await attachLiveReviewStats(profile);

    sendSuccess(res, profileWithReviewStats, 'Teacher retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Search and filter teachers
 * GET /api/teachers
 */
const searchTeachers = async (req, res, next) => {
  try {
    const {
      subject,
      minPrice,
      maxPrice,
      gender,
      minExperience,
      education,
      sortBy = 'rating',
      order = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause
    const where = {
      isOnline: true
    };

    if (gender) {
      where.gender = gender;
    }

    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) where.hourlyRate[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.hourlyRate[Op.lte] = parseFloat(maxPrice);
    }

    if (minExperience) {
      where.teachingExperience = { [Op.gte]: parseInt(minExperience) };
    }

    if (education) {
      where.education = { [Op.like]: `%${education}%` };
    }

    if (subject) {
      where.subjects = { [Op.like]: `%${subject}%` };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch teachers
    const { count, rows: teachers } = await TeacherProfile.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'status'],
        where: { status: 'active' }
      }],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const teachersWithReviewStats = await Promise.all(
      teachers.map(attachLiveReviewStats)
    );

    sendSuccess(res, {
      teachers: teachersWithReviewStats,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }, 'Teachers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload teacher avatar
 * POST /api/teachers/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    // Update teacher profile
    const profile = await TeacherProfile.findOne({ where: { userId } });

    if (!profile) {
      return sendError(res, 'Teacher profile not found', 404);
    }

    await profile.update({ avatarUrl });

    sendSuccess(res, { avatarUrl }, 'Avatar uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload teacher certificates
 * POST /api/teachers/certificates
 */
const uploadCertificates = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const certificateUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Update teacher profile
    const profile = await TeacherProfile.findOne({ where: { userId } });

    if (!profile) {
      return sendError(res, 'Teacher profile not found', 404);
    }

    // Append to existing certificates
    const existingCerts = profile.certificateUrls || [];
    await profile.update({
      certificateUrls: [...existingCerts, ...certificateUrls]
    });

    sendSuccess(res, { certificateUrls }, 'Certificates uploaded successfully');
  } catch (error) {
    next(error);
  }
};

const analyzeProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { analyzeProfile: runAnalysis } = require('../agents/profileAnalyzer');

    const profile = await TeacherProfile.findOne({ where: { userId } });
    if (!profile) {
      return sendError(res, '请先完善教师档案后再进行分析', 404);
    }

    const result = runAnalysis(profile);
    await profile.update({
      tags: result.tags,
      highlights: result.highlights,
      analyzedAt: result.analyzedAt
    });

    sendSuccess(res, {
      tags: result.tags,
      highlights: result.highlights,
      analyzedAt: result.analyzedAt
    }, 'AI 分析完成，档案标签已更新');
  } catch (error) {
    next(error);
  }
};

const getTeacherReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await Booking.findAll({
      where: {
        teacherId: id,
        studentRating: { [Op.ne]: null }
      },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'username']
      }],
      order: [['id', 'DESC']],
      limit: 20,
      attributes: ['id', 'subject', 'studentRating', 'studentReview', 'bookingDate']
    });

    sendSuccess(res, reviews, 'Reviews fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateProfile,
  getMyProfile,
  getTeacherById,
  searchTeachers,
  uploadAvatar,
  uploadCertificates,
  analyzeProfile,
  getTeacherReviews
};
