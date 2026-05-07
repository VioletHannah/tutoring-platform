import { Button, Card, Row, Col, Typography } from 'antd';
import { UserAddOutlined, TeamOutlined, CalendarOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: '优质教师',
      description: '经过严格审核的专业教师，涵盖各科目'
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: '灵活预约',
      description: '自由选择时间，线上轻松预约'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      title: '安全可靠',
      description: '完善的评价体系，保障服务质量'
    }
  ];

  return (
    <div style={{ padding: '40px 20px', background: '#f0f2f5' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        marginBottom: '40px',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: '20px' }}>
          找家教，就上家教信息平台
        </Title>
        <Paragraph style={{ fontSize: '18px', color: 'white', marginBottom: '30px' }}>
          连接优质教师与学生，让学习更简单
        </Paragraph>
        <Button
          type="primary"
          size="large"
          icon={<TeamOutlined />}
          onClick={() => navigate('/teachers')}
          style={{ marginRight: '16px' }}
        >
          找老师
        </Button>
        <Button
          size="large"
          icon={<UserAddOutlined />}
          onClick={() => navigate('/register')}
          style={{ background: 'white', color: '#667eea' }}
        >
          立即注册
        </Button>
      </div>

      {/* Features */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          平台特色
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} md={8} key={index}>
              <Card style={{ textAlign: 'center', height: '100%' }}>
                <div style={{ marginBottom: '20px' }}>{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        marginTop: '60px',
        background: 'white',
        borderRadius: '8px'
      }}>
        <Title level={2}>开始您的教学或学习之旅</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
          无论您是寻找家教的学生，还是想提供教学服务的教师，我们都欢迎您
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/register')}
        >
          免费注册
        </Button>
      </div>
    </div>
  );
};

export default Home;
