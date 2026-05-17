const path = require('path');
const fs = require('fs');
const { TeacherMaterial, TeacherProfile } = require('../models');
const { reviewTeacherMaterial } = require('../agents/materialReviewAgent');
const { sendSuccess, sendError } = require('../utils/response');

// 上传目录
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const materialDir = path.join(uploadDir, 'teacher-materials');

// 确保目录存在
if (!fs.existsSync(materialDir)) {
  fs.mkdirSync(materialDir, { recursive: true });
}

/**
 * 提取文本内容
 * @param {Object} file - 上传的文件对象
 * @param {string} mimeType - 文件 MIME 类型
 * @returns {Promise<{text: string, warning: string|null}>}
 */
async function extractText(file, mimeType) {
  const warning = null;

  if (mimeType === 'text/plain') {
    // 读取文本文件
    try {
      const text = fs.readFileSync(file.path, 'utf-8');
      return { text: text.substring(0, 5000), warning: null }; // 限制最大5000字符
    } catch (err) {
      return { text: '', warning: '无法读取文本文件内容' };
    }
  }

  if (mimeType === 'application/pdf') {
    // TODO: 未来接入 pdf-parse 或多模态模型进行 OCR
    // if (require('pdf-parse')) { ... }
    return {
      text: '',
      warning: 'PDF 文本提取暂未完整支持，将进行基础审核。图片/PDF 建议人工复核。'
    };
  }

  if (mimeType && mimeType.startsWith('image/')) {
    // TODO: 未来接入 OCR 或多模态大模型
    return {
      text: '',
      warning: '图片文字识别暂未支持，将基于文件信息和材料类型进行基础审核。建议人工复核。'
    };
  }

  return { text: '', warning: '不支持的文件类型进行文本提取' };
}

/**
 * 上传并自动审核材料
 * POST /api/teachers/materials
 */
const uploadMaterial = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return sendError(res, '文件不能为空', 400);
    }

    const { materialType, title } = req.body;

    if (!materialType) {
      return sendError(res, '材料类型不能为空', 400);
    }

    if (!title || title.trim().length < 2) {
      return sendError(res, '材料标题不能少于2个字符', 400);
    }

    // 生成安全的文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const safeFilename = `material-${uniqueSuffix}${ext}`;
    const filePath = path.join(materialDir, safeFilename);

    // 移动文件到目标目录
    fs.renameSync(req.file.path, filePath);

    const fileUrl = `/uploads/teacher-materials/${safeFilename}`;

    // 获取教师档案（用于 AI 审核）
    const teacherProfile = await TeacherProfile.findOne({ where: { userId } });

    // 提取文本
    const { text: extractedText, warning } = await extractText(req.file, req.file.mimetype);

    // AI 审核
    const reviewResult = reviewTeacherMaterial({
      materialType,
      title: title.trim(),
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      extractedText,
      teacherProfile: teacherProfile ? {
        subjects: teacherProfile.subjects,
        fullName: teacherProfile.fullName,
        teachingExperience: teacherProfile.teachingExperience
      } : null
    });

    // 创建材料记录
    const material = await TeacherMaterial.create({
      teacherId: userId,
      materialType,
      title: title.trim(),
      originalFilename: req.file.originalname,
      fileUrl,
      fileMimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      ...reviewResult
    });

    const responseData = {
      id: material.id,
      materialType: material.materialType,
      title: material.title,
      fileUrl: material.fileUrl,
      reviewStatus: material.reviewStatus,
      aiScore: material.aiScore,
      aiSummary: material.aiSummary,
      aiTags: material.aiTags,
      aiHighlights: material.aiHighlights,
      aiRiskFlags: material.aiRiskFlags,
      reviewSuggestion: material.reviewSuggestion,
      createdAt: material.createdAt
    };

    if (warning) {
      return sendSuccess(res, responseData, warning + '，AI 已完成初步审核', 201);
    }

    sendSuccess(res, responseData, '材料上传成功，AI 已完成初步审核', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取我的材料列表
 * GET /api/teachers/my-materials
 */
const getMyMaterials = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const materials = await TeacherMaterial.findAll({
      where: { teacherId: userId },
      order: [['id', 'DESC']]
    });

    sendSuccess(res, materials, '材料列表获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取教师已公开的材料（学生端）
 * GET /api/teachers/:id/materials/public
 */
const getPublicMaterials = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 只返回 approved 的材料，且只返回公开字段
    const materials = await TeacherMaterial.findAll({
      where: {
        teacherId: id,
        reviewStatus: 'approved'
      },
      attributes: [
        'materialType',
        'title',
        'aiSummary',
        'aiTags',
        'aiHighlights',
        'aiScore'
      ],
      order: [['id', 'DESC']]
    });

    const parsed = materials.map(m => {
      const item = m.toJSON ? m.toJSON() : { ...m };
      if (typeof item.aiTags === 'string') item.aiTags = JSON.parse(item.aiTags);
      if (typeof item.aiHighlights === 'string') item.aiHighlights = JSON.parse(item.aiHighlights);
      return item;
    });

    sendSuccess(res, parsed, '公开材料获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 重新触发 AI 审核
 * POST /api/teachers/materials/:id/review-again
 */
const reviewAgain = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const material = await TeacherMaterial.findByPk(id);

    if (!material) {
      return sendError(res, '材料不存在', 404);
    }

    // 权限检查：只能审核自己的材料
    if (material.teacherId !== userId) {
      return sendError(res, '无权访问该材料', 403);
    }

    // 获取最新教师档案
    const teacherProfile = await TeacherProfile.findOne({ where: { userId } });

    // 重新审核
    const reviewResult = reviewTeacherMaterial({
      materialType: material.materialType,
      title: material.title,
      originalFilename: material.originalFilename,
      mimeType: material.fileMimeType,
      extractedText: material.extractedText,
      teacherProfile: teacherProfile ? {
        subjects: teacherProfile.subjects,
        fullName: teacherProfile.fullName,
        teachingExperience: teacherProfile.teachingExperience
      } : null
    });

    await material.update({
      ...reviewResult,
      reviewedAt: new Date()
    });

    sendSuccess(res, {
      id: material.id,
      reviewStatus: material.reviewStatus,
      aiScore: material.aiScore,
      aiSummary: material.aiSummary,
      aiTags: material.aiTags,
      aiHighlights: material.aiHighlights,
      aiRiskFlags: material.aiRiskFlags,
      reviewSuggestion: material.reviewSuggestion
    }, 'AI 重新审核完成');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除材料
 * DELETE /api/teachers/materials/:id
 */
const deleteMaterial = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const material = await TeacherMaterial.findByPk(id);

    if (!material) {
      return sendError(res, '材料不存在', 404);
    }

    // 权限检查
    if (material.teacherId !== userId) {
      return sendError(res, '无权删除该材料', 403);
    }

    // 删除文件
    if (material.fileUrl) {
      const filePath = path.join(process.cwd(), material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await material.destroy();

    sendSuccess(res, null, '材料删除成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取待审核材料（管理员）
 * GET /api/teachers/materials/pending
 * TODO: 需要管理员权限，当前先返回需要人工审核的材料
 */
const getPendingMaterials = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: materials } = await TeacherMaterial.findAndCountAll({
      where: { reviewStatus: 'need_manual_review' },
      include: [{
        model: TeacherProfile,
        as: 'teacherProfile',
        attributes: ['fullName', 'userId']
      }],
      order: [['id', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    sendSuccess(res, {
      materials,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }, '待审核材料列表获取成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMaterial,
  getMyMaterials,
  getPublicMaterials,
  reviewAgain,
  deleteMaterial,
  getPendingMaterials
};