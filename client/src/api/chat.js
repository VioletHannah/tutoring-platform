import request from '../utils/request';

export const chatAPI = {
  getThreads() {
    return request.get('/chat/threads');
  },

  createThread(data) {
    const payload = typeof data === 'object' ? data : { teacherId: data };
    return request.post('/chat/threads', payload);
  },

  getMessages(threadId) {
    return request.get(`/chat/threads/${threadId}/messages`);
  },

  sendMessage(threadId, content) {
    return request.post(`/chat/threads/${threadId}/messages`, { content });
  }
};
