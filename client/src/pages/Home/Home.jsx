import { Button, Card, Col, Row, Typography } from 'antd';
import { CalendarOutlined, SafetyOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ChatPage from '../Chat/ChatPage';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: 42, color: '#1677ff' }} />,
      title: '优质教师',
      description: '浏览经过平台审核的教师档案，了解科目、经验、课时费和资质亮点。'
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 42, color: '#52c41a' }} />,
      title: '灵活预约',
      description: '学生登录后可选择直接预约，也可以先和老师沟通再决定。'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 42, color: '#faad14' }} />,
      title: '安全透明',
      description: '教师资料、预约状态和沟通记录集中管理，服务过程更清晰。'
    }
  ];

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <section style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 20px 44px' }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={13}>
              <Title level={1} style={{ marginBottom: 18 }}>
                家教信息平台
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.8, marginBottom: 28 }}>
                连接学生、家长与优质教师。
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<TeamOutlined />}
                onClick={() => navigate('/teachers')}
                style={{ marginRight: 12 }}
              >
                找老师
              </Button>
              <Button
                size="large"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
              >
                立即注册
              </Button>
            </Col>
            <Col xs={24} lg={11}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 24
              }}>
                <Title level={4} style={{ marginBottom: 12 }}>特色功能：AI 找家教</Title>
                <Paragraph style={{ color: '#64748b', marginBottom: 0 }}>
                  告诉 AI 小助手学生的年级、科目和学习问题等，小助手就会给您推荐合适的老师~
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 20px' }}>
        <Row gutter={[16, 16]}>
          {features.map((feature) => (
            <Col xs={24} md={8} key={feature.title}>
              <Card style={{ height: '100%', borderRadius: 8 }}>
                <div style={{ marginBottom: 18 }}>{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph style={{ color: '#64748b', marginBottom: 0 }}>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 20px 48px' }}>
        <Title level={2} style={{ marginBottom: 16 }}>AI 助手体验</Title>
        <ChatPage embedded guestMode />
      </section>
    </div>
  );
};

export default Home;
