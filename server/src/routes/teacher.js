const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { validate } = require('../middlewares/validator');
const upload = require('../config/upload');
const {
  createTeacherProfileSchema,
  updateTeacherProfileSchema,
  searchTeachersSchema
} = require('../validators/teacherValidator');

// Protected teacher routes
router.get(
  '/my-profile',
  authenticate,
  authorize('teacher'),
  teacherController.getMyProfile
);

router.post(
  '/profile',
  authenticate,
  authorize('teacher'),
  validate(createTeacherProfileSchema),
  teacherController.createOrUpdateProfile
);

router.put(
  '/profile',
  authenticate,
  authorize('teacher'),
  validate(updateTeacherProfileSchema),
  teacherController.createOrUpdateProfile
);

router.post(
  '/avatar',
  authenticate,
  authorize('teacher'),
  upload.single('avatar'),
  teacherController.uploadAvatar
);

router.post(
  '/certificates',
  authenticate,
  authorize('teacher'),
  upload.array('certificates', 5),
  teacherController.uploadCertificates
);

router.post(
  '/analyze-profile',
  authenticate,
  authorize('teacher'),
  teacherController.analyzeProfile
);

// Public routes
router.get('/', optionalAuth, validate(searchTeachersSchema, 'query'), teacherController.searchTeachers);
router.get('/:id/reviews', optionalAuth, teacherController.getTeacherReviews);
router.get('/:id', optionalAuth, teacherController.getTeacherById);

module.exports = router;
