import { create } from 'zustand';
import { authUtils } from '../utils/auth';
import { authAPI } from '../api';

export const useAuthStore = create((set) => ({
  user: authUtils.getUser(),
  token: authUtils.getToken(),
  isAuthenticated: authUtils.isAuthenticated(),
  authChecked: !authUtils.getToken(),
  loading: false,

  // Login
  login: async (credentials) => {
    set({ loading: true });
    try {
      const res = await authAPI.login(credentials);
      const { user, token } = res.data;

      authUtils.setToken(token);
      authUtils.setUser(user);

      set({
        user,
        token,
        isAuthenticated: true,
        authChecked: true,
        loading: false
      });

      return { success: true, user };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Register
  register: async (data) => {
    set({ loading: true });
    try {
      const res = await authAPI.register(data);
      const { user, token } = res.data;

      authUtils.setToken(token);
      authUtils.setUser(user);

      set({
        user,
        token,
        isAuthenticated: true,
        authChecked: true,
        loading: false
      });

      return { success: true, user };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Logout
  logout: () => {
    authUtils.clearAuth();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      authChecked: true
    });
  },

  // Update user info
  updateUser: (user) => {
    authUtils.setUser(user);
    set({ user });
  },

  // Fetch current user
  fetchCurrentUser: async () => {
    try {
      const res = await authAPI.getCurrentUser();
      const user = res.data;
      authUtils.setUser(user);
      set({
        user,
        isAuthenticated: true,
        authChecked: true
      });
      return { success: true, user };
    } catch (error) {
      authUtils.clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        authChecked: true
      });
      return { success: false, error };
    }
  },

  initializeAuth: async () => {
    const token = authUtils.getToken();

    if (!token) {
      authUtils.clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        authChecked: true
      });
      return { success: false };
    }

    set({ authChecked: false });
    try {
      const res = await authAPI.getCurrentUser();
      const user = res.data;
      authUtils.setUser(user);
      set({
        user,
        token,
        isAuthenticated: true,
        authChecked: true
      });
      return { success: true, user };
    } catch (error) {
      authUtils.clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        authChecked: true
      });
      return { success: false, error };
    }
  }
}));
