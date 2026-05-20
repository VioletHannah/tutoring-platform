const { v4: uuidv4 } = require('uuid');
const { processMessage } = require('../agents/consultationAgent');
const { getOrCreate, update, getHistory } = require('../agents/conversation');
const { sendSuccess, sendError } = require('../utils/response');

const startSession = (req, res) => {
  const sessionId = uuidv4();
  const state = getOrCreate(sessionId);

  sendSuccess(res, {
    sessionId,
    claudeSessionId: state.claudeSessionId,
    resumeCommand: `claude --resume ${state.claudeSessionId}`
  }, 'Session created');
};

const sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const message = (req.body.message || '').trim();

    if (!sessionId || !message) {
      return sendError(res, 'Missing sessionId or message', 400);
    }

    if (message.length > 1000) {
      return sendError(res, 'Message content is too long', 400);
    }

    const state = getOrCreate(sessionId);
    const result = await processMessage(message, state, req.user);

    update(sessionId, result.state, message, result);

    sendSuccess(res, {
      message: result,
      sessionId,
      claudeSessionId: result.claudeSessionId || state.claudeSessionId,
      resumeCommand: `claude --resume ${result.claudeSessionId || state.claudeSessionId}`
    }, 'Message processed');
  } catch (error) {
    next(error);
  }
};

const getConversation = (req, res) => {
  const { sessionId } = req.params;
  const history = getHistory(sessionId);

  if (!history || history.length === 0) {
    return sendSuccess(res, { messages: [] }, 'No history');
  }

  sendSuccess(res, { messages: history, sessionId }, 'Success');
};

module.exports = { startSession, sendMessage, getConversation };
