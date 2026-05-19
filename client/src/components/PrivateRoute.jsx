import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../store/authStore';
import { getPostAuthRedirectPath } from '../utils/authRedirect';

const PrivateRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user, authChecked } = useAuthStore();

  if (!authChecked) {
    return (
      <div style={{ minHeight: 'calc(100vh - 134px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to={getPostAuthRedirectPath(user?.role)} replace />;
  }

  return children;
};

export default PrivateRoute;
