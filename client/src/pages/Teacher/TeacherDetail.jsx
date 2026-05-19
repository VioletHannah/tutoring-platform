import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Row, Col, Avatar, Tag, Button, Descriptions, Image, Spin, Empty, Rate, Divider, Typography, List, Alert, Space } from 'antd';
import { UserOutlined, ClockCircleOutlined, DollarOutlined, BookOutlined, CheckCircleOutlined, RobotOutlined, CommentOutlined, SafetyCertificateOutlined, BankOutlined, ExperimentOutlined, ReadOutlined, PaperClipOutlined, FileTextOutlined, MessageOutlined } from '@ant-design/icons';
import { useTeacherStore } from '../../store/teacherStore';
import { useAuthStore } from '../../store/authStore';
import { teacherAPI } from '../../api';
import { UPLOAD_URL, USER_ROLES, MATERIAL_TYPE_LABELS } from '../../utils/constants';
import BookingModal from '../../components/BookingModal';

const { Title, Paragraph, Text } = Typography;

const MATERIAL_TYPE_ICONS = {
  certificate: <SafetyCertificateOutlined />,
  education: <BankOutlined />,
  experience: <ExperimentOutlined />,
  self_intro: <ReadOutlined />,
  other: <PaperClipOutlined />
};

const TeacherDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentTeacher, loading, getTeacherById } = useTeacherStore();
  const { isAuthenticated, user } = useAuthStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [publicMaterials, setPublicMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      getTeacherById(userId);
      fetchReviews(userId);
      fetchPublicMaterials(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (
      searchParams.get('book') === '1' &&
      isAuthenticated &&
      user?.role === USER_ROLES.STUDENT &&
      currentTeacher?.userId
    ) {
      setBookingOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('book');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, isAuthenticated, user?.role, currentTeacher?.userId]);

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

  const fetchPublicMaterials = async (id) => {
    setMaterialsLoading(true);
    try {
      const res = await teacherAPI.getPublicMaterials(id);
      setPublicMaterials(res.data || []);
    } catch {
      setPublicMaterials([]);
    } finally {
      setMaterialsLoading(false);
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

  const getRegisterPath = (intent) => (
    `/register?role=${USER_ROLES.STUDENT}&intent=${intent}&teacherId=${teacher.userId}`
  );

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate(getRegisterPath('book'));
      return;
    }
    if (user?.role !== USER_ROLES.STUDENT) {
      return;
    }
    setBookingOpen(true);
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      navigate(getRegisterPath('chat'));
      return;
    }
    if (user?.role !== USER_ROLES.STUDENT) {
      return;
    }
    navigate(`/messages/teachers/${teacher.userId}`);
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
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Button size="large" block icon={<MessageOutlined />} onClick={handleChatClick}>
                  先和老师沟通
                </Button>
                <Button type="primary" size="large" block icon={<BookOutlined />} onClick={handleBookClick}>
                  直接预约
                </Button>
              </Space>
            ) : !isAuthenticated ? (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Button size="large" block icon={<MessageOutlined />} onClick={() => navigate(getRegisterPath('chat'))}>
                  注册后先沟通
                </Button>
                <Button type="primary" size="large" block icon={<BookOutlined />} onClick={() => navigate(getRegisterPath('book'))}>
                  注册后预约
                </Button>
              </Space>
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

            {/* AI Materials Highlights Section */}
            <Spin spinning={materialsLoading}>
              <Divider />
              <Title level={5}><SafetyCertificateOutlined /> AI 提炼的教师资质亮点</Title>
              {publicMaterials.length > 0 ? (
                <List
                  dataSource={publicMaterials}
                  renderItem={(material) => (
                    <List.Item key={material.id} style={{ padding: '12px 0' }}>
                      <div style={{ width: '100%' }}>
                        <Space style={{ marginBottom: 8 }}>
                          {MATERIAL_TYPE_ICONS[material.materialType] || <FileTextOutlined />}
                          <Text strong>{material.title}</Text>
                          <Tag color="green">{MATERIAL_TYPE_LABELS[material.materialType] || material.materialType}</Tag>
                          {material.aiScore && (
                            <Tag color={material.aiScore >= 80 ? 'green' : 'orange'}>
                              AI评分 {material.aiScore}
                            </Tag>
                          )}
                        </Space>
                        <div style={{ marginBottom: 8, color: '#666' }}>
                          {material.aiSummary}
                        </div>
                        {(material.aiTags || []).length > 0 && (
                          <div style={{ marginBottom: 4 }}>
                            {(material.aiTags).map((tag, i) => (
                              <Tag key={i} color="blue" style={{ marginBottom: 2 }}>{tag}</Tag>
                            ))}
                          </div>
                        )}
                        {(material.aiHighlights || []).length > 0 && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>亮点：</Text>
                            {(material.aiHighlights).map((highlight, i) => (
                              <Tag key={i} color="green" style={{ marginBottom: 2 }}>{highlight}</Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  type="info"
                  message="该教师暂未公开 AI 审核通过的资质材料。"
                  description="教师上传材料并通过 AI 审核后，将在此处展示资质亮点。"
                />
              )}
            </Spin>

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
