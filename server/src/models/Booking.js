const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'teacher_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'booking_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '学生备注'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  teacherReply: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '教师回复',
    field: 'teacher_reply'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_amount'
  },
  studentRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 },
    comment: '学生对教师的评分 (1-5)',
    field: 'student_rating'
  },
  studentReview: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '学生评价内容',
    field: 'student_review'
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['teacher_id'] },
    { fields: ['status'] },
    { fields: ['booking_date'] }
  ]
});

module.exports = Booking;
