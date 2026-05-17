import { create } from 'zustand';
import { bookingAPI } from '../api';

export const useBookingStore = create((set) => ({
  bookings: [],
  currentBooking: null,
  loading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },

  // Get my bookings
  getMyBookings: async (params) => {
    set({ loading: true });
    try {
      const res = await bookingAPI.getMyBookings(params);
      const { bookings, pagination } = res.data;

      set({
        bookings,
        pagination,
        loading: false
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Get booking by ID
  getBookingById: async (id) => {
    set({ loading: true });
    try {
      const res = await bookingAPI.getBookingById(id);
      set({
        currentBooking: res.data,
        loading: false
      });
      return { success: true, booking: res.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Create booking
  createBooking: async (data) => {
    set({ loading: true });
    try {
      const res = await bookingAPI.createBooking(data);
      set({ loading: false });
      return { success: true, booking: res.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Accept booking
  acceptBooking: async (id, reply) => {
    set({ loading: true });
    try {
      await bookingAPI.acceptBooking(id, { teacherReply: reply });
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Reject booking
  rejectBooking: async (id, reply) => {
    set({ loading: true });
    try {
      await bookingAPI.rejectBooking(id, { teacherReply: reply });
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Cancel booking
  cancelBooking: async (id) => {
    set({ loading: true });
    try {
      await bookingAPI.cancelBooking(id);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Complete booking
  completeBooking: async (id) => {
    set({ loading: true });
    try {
      await bookingAPI.completeBooking(id);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Submit review
  submitReview: async (id, data) => {
    set({ loading: true });
    try {
      await bookingAPI.submitReview(id, data);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Generate schedule suggestions
  suggestSchedule: async (data) => {
    set({ loading: true });
    try {
      const res = await bookingAPI.suggestSchedule(data);
      set({ loading: false });
      return { success: true, suggestions: res.data.suggestions, summary: res.data.summary };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  },

  // Confirm schedule and create bookings
  confirmSchedule: async (data) => {
    set({ loading: true });
    try {
      const res = await bookingAPI.confirmSchedule(data);
      set({ loading: false });
      return { success: true, bookings: res.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error };
    }
  }
}));
