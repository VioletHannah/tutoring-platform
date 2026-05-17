import request from '../utils/request';

export const teacherAPI = {
  // Search teachers
  searchTeachers(params) {
    return request.get('/teachers', { params });
  },

  // Get teacher by ID
  getTeacherById(id) {
    return request.get(`/teachers/${id}`);
  },

  // Get my profile
  getMyProfile() {
    return request.get('/teachers/my-profile');
  },

  // Create profile
  createProfile(data) {
    return request.post('/teachers/profile', data);
  },

  // Update profile
  updateProfile(data) {
    return request.put('/teachers/profile', data);
  },

  // Upload avatar
  uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return request.post('/teachers/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Upload certificates
  uploadCertificates(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('certificates', file);
    });
    return request.post('/teachers/certificates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // AI analyze profile
  analyzeProfile() {
    return request.post('/teachers/analyze-profile');
  },

  // Get teacher reviews
  getTeacherReviews(teacherId) {
    return request.get(`/teachers/${teacherId}/reviews`);
  },

  // ============== Material APIs ==============

  // Upload material
  uploadMaterial(formData) {
    return request.post('/teachers/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Get my materials
  getMyMaterials() {
    return request.get('/teachers/my-materials');
  },

  // Re-review material
  reviewAgain(materialId) {
    return request.post(`/teachers/materials/${materialId}/review-again`);
  },

  // Delete material
  deleteMaterial(materialId) {
    return request.delete(`/teachers/materials/${materialId}`);
  },

  // Get teacher's public materials (for student view)
  getPublicMaterials(teacherId) {
    return request.get(`/teachers/${teacherId}/materials/public`);
  }
};
