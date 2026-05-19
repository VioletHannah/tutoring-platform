const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatThread = sequelize.define('ChatThread', {
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
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_message_at'
  }
}, {
  tableName: 'chat_threads',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['student_id', 'teacher_id'] },
    { fields: ['student_id'] },
    { fields: ['teacher_id'] },
    { fields: ['last_message_at'] }
  ]
});

module.exports = ChatThread;
