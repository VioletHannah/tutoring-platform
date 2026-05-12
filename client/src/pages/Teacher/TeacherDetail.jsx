import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Tag, Button, Descriptions, Image, Spin, Empty, Rate, Divider, Typography, List, Alert } from 'antd';
import { UserOutlined, ClockCircleOutlined, DollarOutlined, BookOutlined, CheckCircleOutlined, RobotOutlined, CommentOutlined } from '@ant-design/icons';
import { useTeacherStore } from '../../store/teacherStore';
import { useAuthStore } from '../../store/authStore';
import { teacherAPI } from '../../api';
import { UPLOAD_URL, USER_ROLES } from '../../utils/constants';
import BookingModal from '../../components/BookingModal';

const { Title, Paragraph, Text } = Typography;

const TeacherDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentTeacher, loading, getTeacherById } = useTeacherStore();
  const { isAuthenticated, user } = useAuthStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      getTeacherById(userId);
      fetchReviews(userId);
    }
  }, [userId]);

  const fetchReviews = async (id) => {
    setReviewsLoading(true);
    try {
      const res = await teacherAPI.getTeacherReviews(id);
      setReviews(res.data || []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 134px)' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!currentTeacher) {
    return (
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
        <Card>
          <Empty description="教师信息不存在或已下架" />
        </Card>
      </div>
    );
  }

  const teacher = currentTeacher;

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== USER_ROLES.STUDENT) {
      return;
    }
    setBookingOpen(true);
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Avatar
              size={160}
              src={teacher.avatarUrl ? `${UPLOAD_URL}${teacher.avatarUrl}` : null}
              icon={!teacher.avatarUrl && <UserOutlined />}
            />
            <Title level={3} style={{ marginTop: 16 }}>{teacher.fullName || '未填写'}</Title>
            <Rate disabled value={teacher.rating || 0} allowHalf style={{ fontSize: 16 }} />
            <span style={{ marginLeft: 8, color: '#999' }}>({teacher.totalReviews || 0}条评价)</span>

            <Divider />

            <div style={{ fontSize: 28, color: '#ff4d4f', fontWeight: 'bold', marginBottom: 16 }}>
              ¥{teacher.hourlyRate || '-'}<span style={{ fontSize: 14, fontWeight: 'normal', color: '#999' }}>/小时</span>
            </div>

            {isAuthenticated && user?.role === USER_ROLES.STUDENT ? (
              <Button type="primary" size="large" block onClick={handleBookClick}>
                立即预约
              </Button>
            ) : !isAuthenticated ? (
              <Button type="primary" size="large" block onClick={() => navigate('/login')}>
                登录后预约
              </Button>
            ) : null}
          </Col>

          <Col xs={24} md={16}>
            <Descriptions
              title="基本信息"
              bordered
              column={{ xs: 1, sm: 2 }}
              labelStyle={{ fontWeight: 'bold' }}
            >
              <Descriptions.Item label={<><BookOutlined /> 擅长科目</>}>
                {teacher.subjects?.length ? (
                  teacher.subjects.map(s => <Tag key={s} color="blue">{s}</Tag>)
                ) : (
                  <span style={{ color: '#999' }}>未填写</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="性别">
                {teacher.gender === 'male' ? '男' : teacher.gender === 'female' ? '女' : '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="年龄">
                {teacher.age ? `${teacher.age}岁` : '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="学历">
                {teacher.education || '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label={<><ClockCircleOutlined /> 教龄</>}>
                {teacher.teachingExperience ? `${teacher.teachingExperience}年` : '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label={<><DollarOutlined /> 课时费</>}>
                <span style={{ color: '#ff4d4f' }}>¥{teacher.hourlyRate || '未填写'}/小时</span>
              </Descriptions.Item>
              <Descriptions.Item label={<><CheckCircleOutlined /> 认证状态</>}>
                <Tag color={teacher.user?.status === 'active' ? 'green' : 'orange'}>
                  {teacher.user?.status === 'active' ? '已认证' : '待审核'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>个人简介</Title>
            <Paragraph style={{ minHeight: 80 }}>
              {teacher.introduction || '暂无个人简介。'}
            </Paragraph>

            {teacher.certificateUrls?.length > 0 && (
              <>
                <Divider />
                <Title level={5}>证书资质</Title>
                <Image.PreviewGroup>
                  <Row gutter={[8, 8]}>
                    {teacher.certificateUrls.map((url, index) => (
                      <Col key={index}>
                        <Image
                          src={`${UPLOAD_URL}${url}`}
                          width={120}
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxMiI+5pyJ5Z+fPC90ZXh0Pjwvc3ZnPg=="
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </>
            )}

            {teacher.tags?.length > 0 && (
              <>
                <Divider />
                <Title level={5}><RobotOutlined /> AI 智能分析</Title>
                {teacher.highlights && (
                  <Alert type="info" message={teacher.highlights} style={{ marginBottom: 12 }} />
                )}
                <div>
                  {teacher.tags.map((tag, i) => (
                    <Tag key={i} color="green" style={{ fontSize: 13, padding: '2px 10px' }}>{tag}</Tag>
                  ))}
                </div>
              </>
            )}

            <Divider />
            <Title level={5}><CommentOutlined /> 学生评价 ({teacher.totalReviews || 0})</Title>
            <Spin spinning={reviewsLoading}>
              {reviews.length === 0 ? (
                <Empty description="暂无评价" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <List
                  dataSource={reviews}
                  renderItem={(r) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Rate disabled value={r.studentRating} style={{ fontSize: 14 }} />}
                        title={
                          <span>
                            {r.student?.username || '学生'}
                            <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
                              {r.subject} · {r.bookingDate}
                            </Text>
                          </span>
                        }
                        description={r.studentReview || '（无文字评价）'}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Col>
        </Row>
      </Card>

      <BookingModal
        open={bookingOpen}
        teacher={teacher}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
};

export default TeacherDetail;