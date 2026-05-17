const { Booking, User, TeacherProfile } = require('../models');
const { Op } = require('sequelize');

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Check if two time ranges conflict
 * [startA, endA) and [startB, endB) conflict if: startA < endB && endA > startB
 */
function isTimeConflict(candidate, existingBooking) {
  const startA = candidate.startTime;
  const endA = candidate.endTime;
  const startB = existingBooking.startTime;
  const endB = existingBooking.endTime;

  return startA < endB && endA > startB;
}

/**
 * Parse time string "HH:mm:ss" to minutes from midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to "HH:mm:ss" format
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

/**
 * Check if a date is a past date
 */
function isPastDate(dateStr) {
  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate < today;
}

/**
 * Get weekday number (1=Monday, 7=Sunday)
 */
function getWeekday(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

/**
 * Validate time range (end must be after start)
 */
function isValidTimeRange(timeRange) {
  const startMinutes = timeToMinutes(timeRange.start);
  const endMinutes = timeToMinutes(timeRange.end);
  return endMinutes > startMinutes;
}

/**
 * Build candidate time slots within a time range
 */
function buildCandidateSlotsInRange(date, timeRange, durationMinutes) {
  const slots = [];
  const startMinutes = timeToMinutes(timeRange.start);
  const endMinutes = timeToMinutes(timeRange.end);

  let currentStart = startMinutes;
  while (currentStart + durationMinutes <= endMinutes) {
    const currentEnd = currentStart + durationMinutes;
    slots.push({
      date,
      startTime: minutesToTime(currentStart),
      endTime: minutesToTime(currentEnd)
    });
    currentStart += durationMinutes;
  }

  return slots;
}

/**
 * Build all candidate slots for a given date based on preferences
 */
function buildCandidateSlotsForDate(date, options) {
  const { preferredTimeRanges, durationMinutes } = options;
  const slots = [];

  for (const timeRange of preferredTimeRanges) {
    slots.push(...buildCandidateSlotsInRange(date, timeRange, durationMinutes));
  }

  return slots;
}

/**
 * Check if a candidate slot conflicts with any existing booking
 */
function hasConflict(candidate, existingBookings) {
  return existingBookings.some(booking => isTimeConflict(candidate, booking));
}

/**
 * Generate schedule suggestions based on user preferences
 * @param {Object} options - Schedule options
 * @returns {Promise<{suggestions: Array, summary: Object}>}
 */
async function generateScheduleSuggestions(options) {
  const {
    teacherId,
    subject,
    startDate,
    endDate,
    durationMinutes,
    sessionsPerWeek,
    preferredWeekdays,
    preferredTimeRanges,
    totalSessions,
    location,
    note
  } = options;

  // Validate basic inputs
  if (!teacherId || !subject || !startDate || !endDate) {
    throw new Error('Missing required fields: teacherId, subject, startDate, endDate');
  }

  if (durationMinutes <= 0) {
    throw new Error('durationMinutes must be positive');
  }

  if (sessionsPerWeek <= 0) {
    throw new Error('sessionsPerWeek must be positive');
  }

  if (!preferredWeekdays || preferredWeekdays.length === 0) {
    throw new Error('preferredWeekdays cannot be empty');
  }

  if (!preferredTimeRanges || preferredTimeRanges.length === 0) {
    throw new Error('preferredTimeRanges cannot be empty');
  }

  // Validate time ranges (end must be after start)
  for (const range of preferredTimeRanges) {
    if (!isValidTimeRange(range)) {
      throw new Error(`Invalid time range: end time must be after start time (${range.start} - ${range.end})`);
    }
  }

  // Check if teacher exists and is active
  const teacher = await User.findOne({
    where: { id: teacherId, role: 'teacher', status: 'active' }
  });

  if (!teacher) {
    throw new Error('Teacher not found or not active');
  }

  // Check for past dates
  if (isPastDate(startDate)) {
    throw new Error('Start date cannot be in the past');
  }

  // Parse date range
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new Error('Start date cannot be after end date');
  }

  // Fetch existing bookings that may conflict
  const existingBookings = await Booking.findAll({
    where: {
      teacherId,
      bookingDate: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      },
      status: { [Op.in]: ['pending', 'accepted'] }
    }
  });

  // Generate candidate dates with proper week tracking
  const candidateDates = [];
  const current = new Date(start);
  let weekIndex = 0;
  const weekSessions = new Map();

  // Use UTC-safe date iteration to avoid timezone issues
  while (current <= end) {
    // Format date as YYYY-MM-DD in local time
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const weekday = getWeekday(dateStr);

    if (preferredWeekdays.includes(weekday)) {
      if (!weekSessions.has(weekIndex)) {
        weekSessions.set(weekIndex, 0);
      }

      if (weekSessions.get(weekIndex) < sessionsPerWeek) {
        candidateDates.push({ dateStr, weekday, weekIndex });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  // Build suggestions from candidate dates
  const suggestions = [];
  const requestedSessions = totalSessions || Infinity;

  for (const { dateStr, weekday, weekIndex } of candidateDates) {
    if (suggestions.length >= requestedSessions) break;

    const candidateSlots = buildCandidateSlotsForDate(dateStr, {
      preferredTimeRanges,
      durationMinutes
    });

    for (const slot of candidateSlots) {
      if (suggestions.length >= requestedSessions) break;

      if (!hasConflict(slot, existingBookings)) {
        suggestions.push({
          bookingDate: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
          weekIndex: weekIndex + 1,
          weekday
        });
      }
    }
  }

  return {
    suggestions,
    summary: {
      requestedSessions: totalSessions || suggestions.length,
      generatedSessions: suggestions.length,
      durationMinutes
    }
  };
}

/**
 * Create multiple bookings from schedule items using transaction
 * @param {number} studentId - Student ID
 * @param {Array} scheduleItems - Array of schedule items
 * @param {Object} commonData - Common data for all bookings
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Array>} Created bookings
 */
async function createBookingsFromSchedule(studentId, scheduleItems, commonData, transaction) {
  const { teacherId, subject, location, note } = commonData;

  const createdBookings = [];

  for (const item of scheduleItems) {
    const { bookingDate, startTime, endTime } = item;

    // Double-check for conflicts (don't trust frontend suggestions)
    const conflictingBooking = await Booking.findOne({
      where: {
        teacherId,
        bookingDate,
        status: { [Op.in]: ['pending', 'accepted'] },
        [Op.or]: [
          {
            startTime: { [Op.lte]: startTime },
            endTime: { [Op.gt]: startTime }
          },
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gte]: endTime }
          },
          {
            startTime: { [Op.gte]: startTime },
            endTime: { [Op.lte]: endTime }
          }
        ]
      },
      transaction
    });

    if (conflictingBooking) {
      throw new Error(`Time conflict detected on ${bookingDate} at ${startTime}`);
    }

    // Get teacher's hourly rate for totalAmount calculation
    const teacherProfile = await TeacherProfile.findOne({
      where: { userId: teacherId },
      transaction
    });

    let totalAmount = null;
    if (teacherProfile && teacherProfile.hourlyRate) {
      const start = timeToMinutes(startTime);
      const end = timeToMinutes(endTime);
      const hours = (end - start) / 60;
      totalAmount = hours * teacherProfile.hourlyRate;
    }

    const booking = await Booking.create({
      studentId,
      teacherId,
      subject,
      bookingDate,
      startTime,
      endTime,
      location,
      note,
      totalAmount,
      status: 'pending'
    }, { transaction });

    createdBookings.push(booking);
  }

  return createdBookings;
}

module.exports = {
  generateScheduleSuggestions,
  isTimeConflict,
  buildCandidateSlotsForDate,
  createBookingsFromSchedule,
  timeToMinutes,
  minutesToTime,
  getWeekday,
  isPastDate,
  isValidTimeRange
};
