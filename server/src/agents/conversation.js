const conversations = new Map();

const TTL = 30 * 60 * 1000;
const MAX_MESSAGES = 20;

function createConversation(sessionId) {
  const now = Date.now();
  return {
    stage: 'new',
    claudeSessionId: sessionId,
    claudeSessionStarted: false,
    teacherCatalogSent: false,
    messages: [],
    createdAt: now,
    updatedAt: now
  };
}

function getOrCreate(sessionId) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, createConversation(sessionId));
  }

  return conversations.get(sessionId);
}

function update(sessionId, state, userMsg, agentMsg) {
  const conv = conversations.get(sessionId);
  if (!conv) return;

  conv.stage = state.stage || conv.stage;
  conv.claudeSessionId = state.claudeSessionId || conv.claudeSessionId;
  conv.claudeSessionStarted = Boolean(state.claudeSessionStarted || conv.claudeSessionStarted);
  conv.teacherCatalogSent = Boolean(state.teacherCatalogSent || conv.teacherCatalogSent);
  conv.searchCriteria = state.searchCriteria || conv.searchCriteria || {};
  conv.lastRecommendedTeacherIds = state.lastRecommendedTeacherIds || [];
  conv.messages.push(
    { role: 'user', content: userMsg, time: new Date().toISOString() },
    {
      role: 'agent',
      content: agentMsg.text,
      cards: agentMsg.cards || [],
      time: new Date().toISOString()
    }
  );

  if (conv.messages.length > MAX_MESSAGES) {
    conv.messages = conv.messages.slice(-MAX_MESSAGES);
  }

  conv.updatedAt = Date.now();
}

function getHistory(sessionId) {
  const conv = conversations.get(sessionId);
  return conv ? conv.messages : [];
}

function cleanup() {
  const now = Date.now();
  for (const [id, conv] of conversations) {
    if (now - (conv.updatedAt || conv.createdAt || 0) > TTL) {
      conversations.delete(id);
    }
  }
}

setInterval(cleanup, 5 * 60 * 1000);

module.exports = { getOrCreate, update, getHistory };
