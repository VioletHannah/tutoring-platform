import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  RobotOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { USER_ROLES } from '../../utils/constants';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goProfileCenter = () => {
    if (user?.role === USER_ROLES.TEACHER) {
      navigate('/teacher/dashboard');
      return;
    }

    if (user?.role === USER_ROLES.STUDENT) {
      navigate('/student/dashboard');
      return;
    }

    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: goProfileCenter
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  const visitorMenuItems = [
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

  const studentMenuItems = [
    {
      key: 'teachers',
      icon: <TeamOutlined />,
      label: '找老师',
      onClick: () => navigate('/teachers')
    },
    {
      key: 'chat',
      icon: <RobotOutlined />,
      label: 'AI助手',
      onClick: () => navigate('/chat')
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: '沟通',
      onClick: () => navigate('/messages')
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: '我的预约',
      onClick: () => navigate('/student/bookings')
    }
  ];

  const teacherMenuItems = [
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: '沟通',
      onClick: () => navigate('/messages')
    },
    {
      key: 'teacher-bookings',
      icon: <CalendarOutlined />,
      label: '我的预约',
      onClick: () => navigate('/teacher/bookings')
    }
  ];

  const menuItems = !isAuthenticated
    ? visitorMenuItems
    : user?.role === USER_ROLES.STUDENT
      ? studentMenuItems
      : user?.role === USER_ROLES.TEACHER
        ? teacherMenuItems
        : visitorMenuItems;

  const getSelectedMenuKey = () => {
    const { pathname } = location;

    if (pathname === '/') return 'home';
    if (pathname.startsWith('/teachers')) return 'teachers';
    if (pathname.startsWith('/chat')) return 'chat';
    if (pathname.startsWith('/messages')) return 'messages';
    if (pathname.startsWith('/student/bookings')) return 'bookings';
    if (pathname.startsWith('/teacher/bookings')) return 'teacher-bookings';

    return undefined;
  };

  const selectedMenuKey = getSelectedMenuKey();

  return (
    <AntHeader style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
      <div
        style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: 50, cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        家教信息平台
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        items={menuItems}
        selectedKeys={selectedMenuKey ? [selectedMenuKey] : []}
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
