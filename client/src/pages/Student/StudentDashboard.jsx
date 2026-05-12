import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, Spin, Empty, List, Tag, Typography } from 'antd';
import { TeamOutlined, CalendarOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';

const { Title, Text } = Typography;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bookings, loading, pagination, getMyBookings } = useBookingStore();

  useEffect(() => {
    getMyBookings({ limit: 5 });
  }, []);

  const statusColor = (status) => {
    const map = { pending: 'orange', accepted: 'blue', rejected: 'red', completed: 'green', cancelled: 'default' };
    return map[status] || 'default';
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <Title level={3} style={{ marginBottom: 24 }}>欢迎回来，{user?.username}</Title>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable onClick={() => navigate('/teachers')}>
              <Statistic title="寻找家教" prefix={<SearchOutlined />} value="浏览教师" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable onClick={() => navigate('/student/bookings')}>
              <Statistic title="我的预约" prefix={<CalendarOutlined />} value={pagination.total || 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="进行中"
                prefix={<ClockCircleOutlined />}
                value={bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="已完成" prefix={<TeamOutlined />} value={bookings.filter(b => b.status === 'completed').length} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card
        title="最近预约"
        extra={<Button type="link" onClick={() => navigate('/student/bookings')}>查看全部</Button>}
      >
        <Spin spinning={loading}>
          {bookings.length === 0 ? (
            <Empty description="暂无预约记录">
              <Button type="primary" onClick={() => navigate('/teachers')}>去浏览教师</Button>
            </Empty>
          ) : (
            <List
              dataSource={bookings.slice(0, 5)}
              renderItem={(booking) => (
                <List.Item
                  extra={
                    <Tag color={statusColor(booking.status)}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    title={`${booking.subject} - ${booking.teacher?.fullName || `教师#${booking.teacherId}`}`}
                    description={
                      <Text type="secondary">
                        {booking.bookingDate} {booking.startTime?.slice(0, 5)}-{booking.endTime?.slice(0, 5)}
                        {booking.totalAmount ? ` · ¥${booking.totalAmount}` : ''}
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

export default StudentDashboard;