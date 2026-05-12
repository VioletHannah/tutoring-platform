const { v4: uuidv4 } = require('uuid');
const { processMessage, handleBookRequest } = require('../agents/consultationAgent');
const { getOrCreate, update, getHistory } = require('../agents/conversation');
const { sendSuccess, sendError } = require('../utils/response');

const startSession = (req, res) => {
  const sessionId = uuidv4();
  getOrCreate(sessionId);
  sendSuccess(res, { sessionId }, '会话已创建');
};

const sendMessage = async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return sendError(res, '缺少 sessionId 或 message 参数', 400);
    }

    let state = getOrCreate(sessionId);
    const intent = require('../agents/consultationAgent').parseIntent(message);

    let result;

    if (intent === 'book' || state.stage === 'booking') {
      result = await handleBookRequest(message, state);
    } else {
      result = await processMessage(message, state);
    }

    update(sessionId, result.state, message, result);

    sendSuccess(res, {
      message: result,
      sessionId
    }, '消息已处理');
  } catch (error) {
    next(error);
  }
};

const getConversation = (req, res) => {
  const { sessionId } = req.params;
  const history = getHistory(sessionId);

  if (!history || history.length === 0) {
    return sendSuccess(res, { messages: [] }, '暂无历史记录');
  }

  sendSuccess(res, { messages: history, sessionId }, '获取成功');
};

module.exports = { startSession, sendMessage, getConversation };