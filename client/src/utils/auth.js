const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

export const authUtils = {
  // Get token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set token
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Remove token
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Get user info
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Set user info
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Remove user info
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Clear all auth data
  clearAuth() {
    this.removeToken();
    this.removeUser();
  }
};
