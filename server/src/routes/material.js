const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { validate } = require('../middlewares/validator');
const materialUpload = require('../config/materialUpload');
const {
  uploadMaterialSchema,
  reviewAgainSchema,
  getPendingSchema
} = require('../validators/materialValidator');

// Teacher: upload material
router.post(
  '/materials',
  authenticate,
  authorize('teacher'),
  materialUpload.single('file'),
  validate(uploadMaterialSchema),
  materialController.uploadMaterial
);

// Teacher: get my materials
router.get(
  '/my-materials',
  authenticate,
  authorize('teacher'),
  materialController.getMyMaterials
);

// Teacher: re-review material
router.post(
  '/materials/:id/review-again',
  authenticate,
  authorize('teacher'),
  materialController.reviewAgain
);

// Teacher: delete material
router.delete(
  '/materials/:id',
  authenticate,
  authorize('teacher'),
  materialController.deleteMaterial
);

// Public: get teacher's approved materials (for students)
router.get(
  '/:id/materials/public',
  materialController.getPublicMaterials
);

// Admin: get pending materials (TODO: needs admin role)
router.get(
  '/materials/pending',
  authenticate,
  // TODO: authorize('admin') when admin role is implemented
  validate(getPendingSchema, 'query'),
  materialController.getPendingMaterials
);

module.exports = router;