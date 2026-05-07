const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const teacherRoutes = require('./teacher');
const bookingRoutes = require('./booking');

// Mount routes
router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/bookings', bookingRoutes);

// API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
