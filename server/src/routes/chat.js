const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

router.use(authenticate);
router.use(authorize('student', 'teacher', 'admin'));

router.get('/threads', chatController.getThreads);
router.post('/threads', chatController.createThread);
router.get('/threads/:threadId/messages', chatController.getMessages);
router.post('/threads/:threadId/messages', chatController.sendMessage);

module.exports = router;
