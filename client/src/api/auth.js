import request from '../utils/request';

export const authAPI = {
  // Register
  register(data) {
    return request.post('/auth/register', data);
  },

  // Login
  login(data) {
    return request.post('/auth/login', data);
  },

  // Get current user
  getCurrentUser() {
    return request.get('/auth/me');
  },

  // Change password
  changePassword(data) {
    return request.put('/auth/password', data);
  },

  // Logout
  logout() {
    return request.post('/auth/logout');
  }
};
