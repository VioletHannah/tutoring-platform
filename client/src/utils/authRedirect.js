import { USER_ROLES } from './constants';

export const getPostAuthRedirectPath = (role, options = {}) => {
  switch (role) {
    case USER_ROLES.STUDENT:
      return '/student/dashboard';
    case USER_ROLES.TEACHER:
      return options.isNewUser ? '/teacher/dashboard?welcome=profile' : '/teacher/dashboard';
    default:
      return '/';
  }
};
