const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const TeacherMaterial = sequelize.define('TeacherMaterial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'teacher_id',
    comment: '关联 TeacherProfile 的 userId'
  },
  materialType: {
    type: DataTypes.ENUM('certificate', 'education', 'experience', 'self_intro', 'other'),
    allowNull: false,
    field: 'material_type',
    comment: '材料类型：证书/学历证明/教学经历/个人介绍/其他'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '材料标题'
  },
  originalFilename: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'original_filename',
    comment: '原始文件名（不用于路径拼接，仅记录）'
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'file_url',
    comment: '文件访问路径'
  },
  fileMimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'file_mime_type'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size',
    comment: '文件大小（字节）'
  },
  extractedText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'extracted_text',
    comment: '从文件中提取的文本内容'
  },
  aiSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'ai_summary',
    comment: 'AI 生成的材料摘要（面向学生）'
  },
  aiTags: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'ai_tags',
    comment: 'JSON 数组，AI 标签',
    get() {
      return parseJsonArray(this.getDataValue('aiTags'));
    },
    set(value) {
      this.setDataValue('aiTags', JSON.stringify(value || []));
    }
  },
  aiHighlights: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'ai_highlights',
    comment: 'JSON 数组，AI 亮点提炼',
    get() {
      return parseJsonArray(this.getDataValue('aiHighlights'));
    },
    set(value) {
      this.setDataValue('aiHighlights', JSON.stringify(value || []));
    }
  },
  aiRiskFlags: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'ai_risk_flags',
    comment: 'JSON 数组，AI 风险标记',
    get() {
      return parseJsonArray(this.getDataValue('aiRiskFlags'));
    },
    set(value) {
      this.setDataValue('aiRiskFlags', JSON.stringify(value || []));
    }
  },
  aiScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ai_score',
    comment: 'AI 评分 0-100'
  },
  reviewStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'need_manual_review', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'review_status',
    comment: '审核状态'
  },
  reviewSuggestion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'review_suggestion',
    comment: 'AI 给管理员的审核建议'
  },
  reviewerNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'reviewer_note',
    comment: '管理员人工审核备注'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
  }
}, {
  tableName: 'teacher_materials',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['teacher_id'] },
    { fields: ['review_status'] },
    { fields: ['material_type'] }
  ]
});

module.exports = TeacherMaterial;
