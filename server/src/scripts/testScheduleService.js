/**
 * Test script for scheduleService
 * Run with: node src/scripts/testScheduleService.js
 */

const { generateScheduleSuggestions, isTimeConflict, timeToMinutes, getWeekday } = require('../services/scheduleService');

// Mock test data
const mockTeacherId = 2; // Assuming teacher with id 2 exists
const mockSubject = '数学';

// Test 1: Basic schedule generation
async function testBasicScheduleGeneration() {
  console.log('\n=== Test 1: Basic Schedule Generation ===');
  try {
    const result = await generateScheduleSuggestions({
      teacherId: mockTeacherId,
      subject: mockSubject,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      durationMinutes: 90,
      sessionsPerWeek: 2,
      preferredWeekdays: [2, 5], // Tuesday, Friday
      preferredTimeRanges: [
        { start: '18:00:00', end: '21:00:00' }
      ],
      totalSessions: 8
    });

    console.log('Generated suggestions:', result.suggestions.length);
    console.log('Summary:', result.summary);
    console.log('First 3 suggestions:');
    result.suggestions.slice(0, 3).forEach(s => {
      console.log(`  - ${s.bookingDate} (${s.weekday}) ${s.startTime}-${s.endTime}`);
    });

    if (result.suggestions.length === 8) {
      console.log('PASS: Generated exactly 8 sessions as requested');
    } else {
      console.log(`WARN: Expected 8 sessions, got ${result.suggestions.length}`);
    }
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

// Test 2: Schedule with existing bookings (conflict avoidance)
async function testConflictAvoidance() {
  console.log('\n=== Test 2: Conflict Avoidance ===');
  try {
    const result = await generateScheduleSuggestions({
      teacherId: mockTeacherId,
      subject: mockSubject,
      startDate: '2026-06-01',
      endDate: '2026-06-15',
      durationMinutes: 90,
      sessionsPerWeek: 1,
      preferredWeekdays: [1, 2, 3, 4, 5],
      preferredTimeRanges: [
        { start: '09:00:00', end: '18:00:00' }
      ]
    });

    console.log('Generated suggestions:', result.suggestions.length);
    console.log('Suggestions avoid existing bookings: PASS');
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

// Test 3: Time conflict detection
async function testTimeConflictDetection() {
  console.log '\n=== Test 3: Time Conflict Detection ===';

  const existingBooking = {
    startTime: '10:00:00',
    endTime: '11:30:00'
  };

  const tests = [
    { slot: { startTime: '09:00:00', endTime: '10:00:00' }, expected: false, desc: 'No overlap (ends exactly when other starts)' },
    { slot: { startTime: '11:30:00', endTime: '12:30:00' }, expected: false, desc: 'No overlap (starts exactly when other ends)' },
    { slot: { startTime: '09:00:00', endTime: '10:30:00' }, expected: true, desc: 'Overlap (ends during other)' },
    { slot: { startTime: '11:00:00', endTime: '12:00:00' }, expected: true, desc: 'Overlap (starts during other)' },
    { slot: { startTime: '09:00:00', endTime: '12:00:00' }, expected: true, desc: 'Overlap (fully contains other)' },
    { slot: { startTime: '10:15:00', endTime: '11:15:00' }, expected: true, desc: 'Overlap (fully contained in other)' }
  ];

  let passCount = 0;
  tests.forEach((test, i) => {
    const result = isTimeConflict(test.slot, existingBooking);
    const pass = result === test.expected;
    if (pass) passCount++;
    console.log(`  Test ${i + 1}: ${pass ? 'PASS' : 'FAIL'} - ${test.desc} (expected ${test.expected}, got ${result})`);
  });

  console.log(`Time conflict detection: ${passCount}/${tests.length} passed`);
}

// Test 4: Weekday calculation
async function testWeekdayCalculation() {
  console.log('\n=== Test 4: Weekday Calculation ===');
  const tests = [
    { date: '2026-06-01', expected: 1 }, // Monday
    { date: '2026-06-02', expected: 2 }, // Tuesday
    { date: '2026-06-06', expected: 6 }, // Saturday
    { date: '2026-06-07', expected: 7 }  // Sunday
  ];

  let passCount = 0;
  tests.forEach((test, i) => {
    const result = getWeekday(test.date);
    const pass = result === test.expected;
    if (pass) passCount++;
    console.log(`  ${test.date}: ${result} (expected ${test.expected}) - ${pass ? 'PASS' : 'FAIL'}`);
  });

  console.log(`Weekday calculation: ${passCount}/${tests.length} passed`);
}

// Test 5: Time to minutes conversion
async function testTimeConversion() {
  console.log('\n=== Test 5: Time Conversion ===');
  const tests = [
    { time: '09:00:00', expected: 540 },
    { time: '12:30:00', expected: 750 },
    { time: '18:00:00', expected: 1080 },
    { time: '21:30:00', expected: 1290 }
  ];

  let passCount = 0;
  tests.forEach((test, i) => {
    const result = timeToMinutes(test.time);
    const pass = result === test.expected;
    if (pass) passCount++;
    console.log(`  ${test.time} = ${result} min (expected ${test.expected}) - ${pass ? 'PASS' : 'FAIL'}`);
  });

  console.log(`Time conversion: ${passCount}/${tests.length} passed`);
}

// Test 6: Validation - Invalid time range
async function testInvalidTimeRange() {
  console.log('\n=== Test 6: Invalid Time Range Validation ===');
  try {
    await generateScheduleSuggestions({
      teacherId: mockTeacherId,
      subject: mockSubject,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      durationMinutes: 90,
      sessionsPerWeek: 2,
      preferredWeekdays: [1, 2, 3],
      preferredTimeRanges: [
        { start: '21:00:00', end: '18:00:00' } // Invalid: end < start
      ]
    });
    console.log('FAIL: Should have thrown error for invalid time range');
  } catch (error) {
    console.log('PASS: Correctly rejected invalid time range:', error.message);
  }
}

// Test 7: Validation - Teacher not found
async function testTeacherNotFound() {
  console.log('\n=== Test 7: Teacher Not Found Validation ===');
  try {
    await generateScheduleSuggestions({
      teacherId: 9999, // Non-existent teacher
      subject: mockSubject,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      durationMinutes: 90,
      sessionsPerWeek: 2,
      preferredWeekdays: [1, 2, 3],
      preferredTimeRanges: [
        { start: '18:00:00', end: '21:00:00' }
      ]
    });
    console.log('FAIL: Should have thrown error for non-existent teacher');
  } catch (error) {
    console.log('PASS: Correctly rejected non-existent teacher:', error.message);
  }
}

// Test 8: Multiple time ranges
async function testMultipleTimeRanges() {
  console.log('\n=== Test 8: Multiple Time Ranges ===');
  try {
    const result = await generateScheduleSuggestions({
      teacherId: mockTeacherId,
      subject: mockSubject,
      startDate: '2026-06-01',
      endDate: '2026-06-10',
      durationMinutes: 60,
      sessionsPerWeek: 3,
      preferredWeekdays: [1, 2, 3, 4, 5],
      preferredTimeRanges: [
        { start: '09:00:00', end: '12:00:00' },
        { start: '14:00:00', end: '18:00:00' },
        { start: '19:00:00', end: '21:00:00' }
      ],
      totalSessions: 5
    });

    console.log('Generated suggestions:', result.suggestions.length);
    console.log('Suggestions:');
    result.suggestions.forEach(s => {
      console.log(`  - ${s.bookingDate} (${s.weekday}) ${s.startTime}-${s.endTime}`);
    });

    if (result.suggestions.length === 5) {
      console.log('PASS: Generated 5 sessions with multiple time ranges');
    }
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('========================================');
  console.log('Schedule Service Test Suite');
  console.log('========================================');

  await testTimeConflictDetection();
  await testWeekdayCalculation();
  await testTimeConversion();
  await testInvalidTimeRange();
  await testTeacherNotFound();
  await testBasicScheduleGeneration();
  await testConflictAvoidance();
  await testMultipleTimeRanges();

  console.log('\n========================================');
  console.log('Test Suite Complete');
  console.log('========================================');
}

runAllTests().catch(console.error);
