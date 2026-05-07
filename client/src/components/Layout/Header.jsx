import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { USER_ROLES } from '../../utils/constants';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => {
        if (user?.role === USER_ROLES.TEACHER) {
          navigate('/teacher/profile');
        } else if (user?.role === USER_ROLES.STUDENT) {
          navigate('/student/dashboard');
        }
      }
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/')
    },
    {
      key: 'teachers',
      icon: <TeamOutlined />,
      label: '找老师',
      onClick: () => navigate('/teachers')
    }
  ];

  if (isAuthenticated) {
    if (user?.role === USER_ROLES.STUDENT) {
      menuItems.push({
        key: 'bookings',
        icon: <CalendarOutlined />,
        label: '我的预约',
        onClick: () => navigate('/student/bookings')
      });
    } else if (user?.role === USER_ROLES.TEACHER) {
      menuItems.push({
        key: 'teacher-bookings',
        icon: <CalendarOutlined />,
        label: '预约管理',
        onClick: () => navigate('/teacher/bookings')
      });
    }
  }

  return (
    <AntHeader style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
      <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginRight: '50px' }}>
        家教信息平台
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        items={menuItems}
        style={{ flex: 1, minWidth: 0 }}
      />

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>{user?.username}</span>
            </div>
          </Dropdown>
        ) : (
          <div>
            <Button type="link" style={{ color: 'white' }} onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </div>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
