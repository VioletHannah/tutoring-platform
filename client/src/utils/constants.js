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

export const MATERIAL_TYPES = [
  { label: '证书/资格证', value: 'certificate' },
  { label: '学历证明', value: 'education' },
  { label: '教学经历', value: 'experience' },
  { label: '个人介绍', value: 'self_intro' },
  { label: '其他材料', value: 'other' }
];

export const MATERIAL_TYPE_LABELS = {
  certificate: '证书',
  education: '学历证明',
  experience: '教学经历',
  self_intro: '个人介绍',
  other: '其他'
};

export const REVIEW_STATUS_CONFIG = {
  pending: { color: 'blue', label: '待审核' },
  approved: { color: 'green', label: '已通过' },
  need_manual_review: { color: 'orange', label: '需人工复核' },
  rejected: { color: 'red', label: '已拒绝' }
};

export const WEEKDAY_OPTIONS = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 }
];

export const DURATION_OPTIONS = [
  { label: '45 分钟', value: 45 },
  { label: '60 分钟', value: 60 },
  { label: '90 分钟', value: 90 },
  { label: '120 分钟', value: 120 }
];

export const SESSIONS_PER_WEEK_OPTIONS = [
  { label: '每周 1 次', value: 1 },
  { label: '每周 2 次', value: 2 },
  { label: '每周 3 次', value: 3 },
  { label: '每周 4 次', value: 4 },
  { label: '每周 5 次', value: 5 }
];

export const TIME_RANGE_PRESETS = [
  { label: '上午 (9:00-12:00)', start: '09:00:00', end: '12:00:00' },
  { label: '下午 (14:00-18:00)', start: '14:00:00', end: '18:00:00' },
  { label: '晚上 (18:00-21:00)', start: '18:00:00', end: '21:00:00' }
];
