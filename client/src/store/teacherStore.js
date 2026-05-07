import { create } from 'zustand';
import { teacherAPI } from '../api';

export const useTeacherStore = create((set, get) => ({
  teachers: [],
  currentTeacher: null,
  myProfile: null,
  loading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  searchParams: {},

  // Search teachers
  searchTeachers: async (params) => {
    set({ loading: true });
    try {
      const res = await teacherAPI.searchTeachers(params);
      const { teachers, pagination } = res.data;

      set({
        teachers,
        pagination,
        searchParams: params,
        loading: false
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Get teacher by ID
  getTeacherById: async (id) => {
    set({ loading: true });
    try {
      const res = await teacherAPI.getTeacherById(id);
      set({
        currentTeacher: res.data,
        loading: false
      });
      return { success: true, teacher: res.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Get my profile (for teachers)
  getMyProfile: async () => {
    set({ loading: true });
    try {
      const res = await teacherAPI.getMyProfile();
      set({
        myProfile: res.data,
        loading: false
      });
      return { success: true, profile: res.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Create/Update profile
  saveProfile: async (data) => {
    set({ loading: true });
    try {
      const res = get().myProfile
        ? await teacherAPI.updateProfile(data)
        : await teacherAPI.createProfile(data);

      set({
        myProfile: res.data,
        loading: false
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Clear current teacher
  clearCurrentTeacher: () => {
    set({ currentTeacher: null });
  }
}));
