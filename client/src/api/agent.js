import request from '../utils/request';

export const agentAPI = {
  startSession() {
    return request.post('/agent/session');
  },

  sendMessage(sessionId, message) {
    return request.post('/agent/message', { sessionId, message }, { timeout: 120000 });
  },

  getConversation(sessionId) {
    return request.get(`/agent/conversation/${sessionId}`);
  }
};
