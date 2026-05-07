export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '/uploads';

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  INSTITUTION: 'institution',
  ADMIN: 'admin'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const BOOKING_STATUS_LABELS = {
  pending: '待确认',
  accepted: '已接受',
  rejected: '已拒绝',
  completed: '已完成',
  cancelled: '已取消'
};

export const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
];

export const SUBJECTS = [
  '数学', '英语', '物理', '化学', '生物',
  '语文', '历史', '地理', '政治', '计算机'
];
