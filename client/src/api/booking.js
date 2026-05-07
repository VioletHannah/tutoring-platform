import request from '../utils/request';

export const bookingAPI = {
  // Create booking
  createBooking(data) {
    return request.post('/bookings', data);
  },

  // Get my bookings
  getMyBookings(params) {
    return request.get('/bookings', { params });
  },

  // Get booking by ID
  getBookingById(id) {
    return request.get(`/bookings/${id}`);
  },

  // Accept booking (teacher)
  acceptBooking(id, data) {
    return request.put(`/bookings/${id}/accept`, data);
  },

  // Reject booking (teacher)
  rejectBooking(id, data) {
    return request.put(`/bookings/${id}/reject`, data);
  },

  // Complete booking (teacher)
  completeBooking(id) {
    return request.put(`/bookings/${id}/complete`);
  },

  // Cancel booking
  cancelBooking(id) {
    return request.put(`/bookings/${id}/cancel`);
  }
};
