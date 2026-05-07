const User = require('./User');
const TeacherProfile = require('./TeacherProfile');
const StudentProfile = require('./StudentProfile');
const Institution = require('./Institution');
const Booking = require('./Booking');

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

module.exports = {
  User,
  TeacherProfile,
  StudentProfile,
  Institution,
  Booking
};
