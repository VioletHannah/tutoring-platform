const { ChatThread, ChatMessage, User, TeacherProfile } = require('../models');
const { sequelize } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const userAttributes = ['id', 'username', 'email', 'role'];
const teacherProfileAttributes = [
  'userId',
  'fullName',
  'subjects',
  'hourlyRate',
  'teachingExperience',
  'education',
  'avatarUrl',
  'rating',
  'totalReviews'
];

const threadIncludes = [
  {
    model: User,
    as: 'student',
    attributes: userAttributes
  },
  {
    model: User,
    as: 'teacher',
    attributes: userAttributes,
    include: [
      {
        model: TeacherProfile,
        as: 'teacherProfile',
        attributes: teacherProfileAttributes
      }
    ]
  }
];

const canAccessThread = (thread, user) => {
  return thread.studentId === user.userId || thread.teacherId === user.userId || user.role === 'admin';
};

const attachLastMessages = async (threads) => {
  return Promise.all(threads.map(async (thread) => {
    const data = thread.toJSON();
    const lastMessage = await ChatMessage.findOne({
      where: { threadId: thread.id },
      include: [{ model: User, as: 'sender', attributes: userAttributes }],
      order: [[sequelize.col('ChatMessage.created_at'), 'DESC']]
    });
    data.lastMessage = lastMessage ? lastMessage.toJSON() : null;
    return data;
  }));
};

const getThreads = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.role === 'student') {
      where.studentId = req.user.userId;
    } else if (req.user.role === 'teacher') {
      where.teacherId = req.user.userId;
    } else if (req.user.role !== 'admin') {
      return sendError(res, 'Only students and teachers can use chat', 403);
    }

    const threads = await ChatThread.findAll({
      where,
      include: threadIncludes,
      order: [
        [sequelize.col('ChatThread.last_message_at'), 'DESC'],
        [sequelize.col('ChatThread.updated_at'), 'DESC']
      ]
    });

    sendSuccess(res, await attachLastMessages(threads), 'Chat threads retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createThread = async (req, res, next) => {
  try {
    let studentId;
    let teacherId;

    if (req.user.role === 'student') {
      studentId = req.user.userId;
      teacherId = parseInt(req.body.teacherId, 10);

      if (!teacherId) {
        return sendError(res, 'teacherId is required', 400);
      }

      const teacher = await User.findOne({
        where: { id: teacherId, role: 'teacher', status: 'active' }
      });

      if (!teacher) {
        return sendError(res, 'Teacher not found or not active', 404);
      }
    } else if (req.user.role === 'teacher') {
      teacherId = req.user.userId;
      studentId = parseInt(req.body.studentId, 10);

      if (!studentId) {
        return sendError(res, 'studentId is required', 400);
      }

      const student = await User.findOne({
        where: { id: studentId, role: 'student', status: 'active' }
      });

      if (!student) {
        return sendError(res, 'Student not found or not active', 404);
      }
    } else {
      return sendError(res, 'Only students and teachers can start a chat', 403);
    }

    if (teacherId === studentId) {
      return sendError(res, 'Cannot chat with yourself', 400);
    }

    const [thread] = await ChatThread.findOrCreate({
      where: {
        studentId,
        teacherId
      },
      defaults: {
        studentId,
        teacherId,
        lastMessageAt: null
      }
    });

    const completeThread = await ChatThread.findByPk(thread.id, {
      include: threadIncludes
    });

    sendSuccess(res, completeThread, 'Chat thread ready', 201);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const thread = await ChatThread.findByPk(req.params.threadId, {
      include: threadIncludes
    });

    if (!thread) {
      return sendError(res, 'Chat thread not found', 404);
    }

    if (!canAccessThread(thread, req.user)) {
      return sendError(res, 'Access denied', 403);
    }

    const messages = await ChatMessage.findAll({
      where: { threadId: thread.id },
      include: [{ model: User, as: 'sender', attributes: userAttributes }],
      order: [[sequelize.col('ChatMessage.created_at'), 'ASC']]
    });

    sendSuccess(res, { thread, messages }, 'Messages retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) {
      return sendError(res, 'Message content is required', 400);
    }

    if (content.length > 1000) {
      return sendError(res, 'Message content is too long', 400);
    }

    const thread = await ChatThread.findByPk(req.params.threadId);

    if (!thread) {
      return sendError(res, 'Chat thread not found', 404);
    }

    if (!canAccessThread(thread, req.user)) {
      return sendError(res, 'Access denied', 403);
    }

    const chatMessage = await ChatMessage.create({
      threadId: thread.id,
      senderId: req.user.userId,
      content
    });

    await thread.update({ lastMessageAt: chatMessage.createdAt });

    const completeMessage = await ChatMessage.findByPk(chatMessage.id, {
      include: [{ model: User, as: 'sender', attributes: userAttributes }]
    });

    sendSuccess(res, completeMessage, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getThreads,
  createThread,
  getMessages,
  sendMessage
};
