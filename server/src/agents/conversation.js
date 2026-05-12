const conversations = new Map();

const TTL = 30 * 60 * 1000; // 30 min expiry

function getOrCreate(sessionId) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, { stage: 0, messages: [], createdAt: Date.now() });
  }
  return conversations.get(sessionId);
}

function update(sessionId, state, userMsg, agentMsg) {
  const conv = conversations.get(sessionId);
  if (!conv) return;
  conv.stage = state.stage;
  conv.messages.push(
    { role: 'user', content: userMsg, time: new Date().toISOString() },
    { role: 'agent', content: agentMsg.text, cards: agentMsg.cards || [], time: new Date().toISOString() }
  );
  if (state.subject) conv.subject = state.subject;
  if (state.grade) conv.grade = state.grade;
  if (state.gender) conv.gender = state.gender;
  if (state.selectedTeacher) conv.selectedTeacher = state.selectedTeacher;
  conv.updatedAt = Date.now();
}

function getHistory(sessionId) {
  const conv = conversations.get(sessionId);
  return conv ? conv.messages : [];
}

function cleanup() {
  const now = Date.now();
  for (const [id, conv] of conversations) {
    if (now - conv.updatedAt > TTL) conversations.delete(id);
  }
}

setInterval(cleanup, 5 * 60 * 1000);

module.exports = { getOrCreate, update, getHistory };