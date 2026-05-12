const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const teacherRoutes = require('./teacher');
const bookingRoutes = require('./booking');
const agentRoutes = require('./agent');

// Mount routes
router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/bookings', bookingRoutes);
router.use('/agent', agentRoutes);

// API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
