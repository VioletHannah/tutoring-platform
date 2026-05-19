const User = require('./User');
const TeacherProfile = require('./TeacherProfile');
const StudentProfile = require('./StudentProfile');
const Institution = require('./Institution');
const Booking = require('./Booking');
const TeacherMaterial = require('./TeacherMaterial');
const ChatThread = require('./ChatThread');
const ChatMessage = require('./ChatMessage');

// Define associations
// User - TeacherProfile (1:1)
User.hasOne(TeacherProfile, {
  foreignKey: 'userId',
  as: 'teacherProfile',
  onDelete: 'CASCADE'
});
TeacherProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User - StudentProfile (1:1)
User.hasOne(StudentProfile, {
  foreignKey: 'userId',
  as: 'studentProfile',
  onDelete: 'CASCADE'
});
StudentProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User - Institution (1:1)
User.hasOne(Institution, {
  foreignKey: 'userId',
  as: 'institution',
  onDelete: 'CASCADE'
});
Institution.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User - Booking relationships
// Student bookings
User.hasMany(Booking, {
  foreignKey: 'studentId',
  as: 'studentBookings'
});
Booking.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

// Teacher bookings
User.hasMany(Booking, {
  foreignKey: 'teacherId',
  as: 'teacherBookings'
});
Booking.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher'
});

// TeacherProfile - TeacherMaterial (1:N)
TeacherProfile.hasMany(TeacherMaterial, {
  foreignKey: 'teacherId',
  as: 'materials',
  sourceKey: 'userId'
});
TeacherMaterial.belongsTo(TeacherProfile, {
  foreignKey: 'teacherId',
  as: 'teacherProfile',
  targetKey: 'userId'
});

// User - ChatThread relationships
User.hasMany(ChatThread, {
  foreignKey: 'studentId',
  as: 'studentChatThreads'
});
ChatThread.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

User.hasMany(ChatThread, {
  foreignKey: 'teacherId',
  as: 'teacherChatThreads'
});
ChatThread.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher'
});

// ChatThread - ChatMessage relationships
ChatThread.hasMany(ChatMessage, {
  foreignKey: 'threadId',
  as: 'messages',
  onDelete: 'CASCADE'
});
ChatMessage.belongsTo(ChatThread, {
  foreignKey: 'threadId',
  as: 'thread'
});

User.hasMany(ChatMessage, {
  foreignKey: 'senderId',
  as: 'sentChatMessages'
});
ChatMessage.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

module.exports = {
  User,
  TeacherProfile,
  StudentProfile,
  Institution,
  Booking,
  TeacherMaterial,
  ChatThread,
  ChatMessage
};
