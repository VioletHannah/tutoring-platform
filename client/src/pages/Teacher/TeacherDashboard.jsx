import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Empty, List, Row, Spin, Statistic, Tag, Typography } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';

const { Title, Text } = Typography;

const statusColor = (status) => {
  const map = {
    pending: 'orange',
    accepted: 'blue',
    rejected: 'red',
    completed: 'green',
    cancelled: 'default'
  };
  return map[status] || 'default';
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { bookings, loading, pagination, getMyBookings } = useBookingStore();
  const shouldGuideProfile = searchParams.get('welcome') === 'profile';

  useEffect(() => {
    getMyBookings({ limit: 5 });
  }, [getMyBookings]);

  const activeBookings = bookings.filter(
    booking => booking.status === 'pending' || booking.status === 'accepted'
  );
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <Title level={3} style={{ marginBottom: 24 }}>欢迎回来，{user?.username}</Title>

      {shouldGuideProfile && (
        <Alert
          type="info"
          showIcon
          message="欢迎成为平台教师"
          description="请先完善教师档案，补充授课科目、课时费、个人简介和资质材料，学生才能更放心地了解并预约您。"
          action={
            <Button type="primary" onClick={() => navigate('/teacher/profile')}>
              完善我的档案
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable onClick={() => navigate('/teacher/profile')}>
              <Statistic title="我的档案" prefix={<FileTextOutlined />} value="完善资料" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable onClick={() => navigate('/messages')}>
              <Statistic title="沟通" prefix={<MessageOutlined />} value="查看消息" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable onClick={() => navigate('/teacher/bookings')}>
              <Statistic title="我的预约" prefix={<CalendarOutlined />} value={pagination.total || 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="待处理请求" prefix={<ClockCircleOutlined />} value={pendingBookings.length} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card
        title="最近预约请求"
        extra={<Button type="link" onClick={() => navigate('/teacher/bookings')}>查看全部</Button>}
      >
        <Spin spinning={loading}>
          {activeBookings.length === 0 ? (
            <Empty description="暂无待处理或进行中的预约">
              <Button type="primary" onClick={() => navigate('/teacher/profile')}>完善教师档案</Button>
            </Empty>
          ) : (
            <List
              dataSource={activeBookings.slice(0, 5)}
              renderItem={(booking) => (
                <List.Item
                  extra={
                    <Tag color={statusColor(booking.status)}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    avatar={<UserOutlined />}
                    title={`${booking.subject} - ${booking.student?.username || `学生#${booking.studentId}`}`}
                    description={
                      <Text type="secondary">
                        {booking.bookingDate} {booking.startTime?.slice(0, 5)}-{booking.endTime?.slice(0, 5)}
                        {booking.location ? ` · ${booking.location}` : ''}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
