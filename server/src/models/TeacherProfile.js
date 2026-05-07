const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherProfile = sequelize.define('TeacherProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  education: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  teachingExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '教学经验（年）',
    field: 'teaching_experience'
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '时薪',
    field: 'hourly_rate'
  },
  subjects: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式存储教学科目',
    get() {
      const rawValue = this.getDataValue('subjects');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('subjects', JSON.stringify(value));
    }
  },
  introduction: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '个人简介'
  },
  avatarUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'avatar_url'
  },
  certificateUrls: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式存储证书图片',
    field: 'certificate_urls',
    get() {
      const rawValue = this.getDataValue('certificateUrls');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('certificateUrls', JSON.stringify(value));
    }
  },
  availableTimes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式存储可用时间',
    field: 'available_times',
    get() {
      const rawValue = this.getDataValue('availableTimes');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('availableTimes', JSON.stringify(value));
    }
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_online'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_reviews'
  }
}, {
  tableName: 'teacher_profiles',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['hourly_rate'] },
    { fields: ['rating'] }
  ]
});

module.exports = TeacherProfile;
