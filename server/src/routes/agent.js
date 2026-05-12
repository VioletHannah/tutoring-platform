const express = require('express');
const router = express.Router();
const { startSession, sendMessage, getConversation } = require('../controllers/agentController');
const { optionalAuth } = require('../middlewares/auth');

router.post('/session', optionalAuth, startSession);
router.post('/message', optionalAuth, sendMessage);
router.get('/conversation/:sessionId', optionalAuth, getConversation);

module.exports = router;