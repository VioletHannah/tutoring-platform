import { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Card, Tag, Rate, Spin, Typography, Space, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { agentAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import BookingModal from '../../components/BookingModal';

const { Text, Paragraph } = Typography;

const WELCOME_MSG = {
  role: 'agent',
  content: '您好！我是家教AI助手 🎓\n\n我可以帮您：\n• 🔍 智能匹配最合适的家教老师\n• 💬 多轮对话理解您的需求\n• 📅 一键预约课程\n\n请告诉我您想找什么样的老师？',
  time: new Date().toISOString()
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingTeacher, setBookingTeacher] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await agentAPI.startSession();
        setSessionId(res.data.sessionId);
      } catch {
        message.error('创建会话失败');
      }
    };
    createSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId) return;

    const userMsg = { role: 'user', content: text, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await agentAPI.sendMessage(sessionId, text);
      const result = res.data.message;

      setMessages(prev => [...prev, {
        role: 'agent',
        content: result.text,
        cards: result.cards || [],
        time: new Date().toISOString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: '抱歉，AI助手遇到了点问题，请稍后重试。',
        time: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBook = (teacher) => {
    if (!isAuthenticated) {
      message.info('请先登录后再预约');
      navigate('/login');
      return;
    }
    setBookingTeacher(teacher);
    setBookingOpen(true);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';

    return (
      <div key={index} style={{
        display: 'flex', marginBottom: 20,
        justifyContent: isUser ? 'flex-end' : 'flex-start'
      }}>
        {!isUser && (
          <Avatar
            icon={<RobotOutlined />}
            style={{ backgroundColor: '#1677ff', flexShrink: 0, marginRight: 12 }}
          />
        )}
        <div style={{ maxWidth: '75%' }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: 12,
            background: isUser ? '#1677ff' : '#f5f5f5',
            color: isUser ? '#fff' : '#333',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.6
          }}>
            {msg.content}
          </div>

          {msg.cards && msg.cards.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {msg.cards.map((card, ci) => (
                  <Card
                    key={ci}
                    size="small"
                    hoverable
                    style={{ borderRadius: 8 }}
                    title={
                      <Space>
                        <span style={{ fontSize: 16, fontWeight: 'bold' }}>{card.fullName}</span>
                        {card.highlight && (
                          <Text type="secondary" style={{ fontSize: 12 }}>{card.highlight}</Text>
                        )}
                      </Space>
                    }
                    extra={
                      <Rate disabled value={card.rating} allowHalf style={{ fontSize: 14 }} />
                    }
                    onClick={() => navigate(`/teachers/${card.userId}`)}
                  >
                    <div style={{ marginBottom: 8 }}>
                      {card.subjects?.map(s => <Tag key={s} color="blue" style={{ marginBottom: 4 }}>{s}</Tag>)}
                    </div>
                    <Paragraph type="secondary" style={{ fontSize: 13, margin: '8px 0' }} ellipsis={{ rows: 2 }}>
                      {card.introduction}
                    </Paragraph>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text style={{ fontSize: 18, color: '#ff4d4f', fontWeight: 'bold' }}>
                          ¥{card.hourlyRate}/小时
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 12 }}>
                          {card.education} · {card.teachingExperience}年经验
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        size="small"
                        icon={<BookOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook({ ...card });
                        }}
                      >
                        预约
                      </Button>
                    </div>
                  </Card>
                ))}
              </Space>
            </div>
          )}
        </div>
        {isUser && (
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: '#52c41a', flexShrink: 0, marginLeft: 12 }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 134px)', background: '#f0f2f5' }}>
      <div style={{
        background: '#fff', padding: '12px 24px', borderBottom: '1px solid #eee',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff' }} size="large" />
        <div>
          <Text strong style={{ fontSize: 16 }}>AI 家教咨询助手</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>智能匹配 · 需求理解 · 一键预约</Text>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px',
        maxWidth: 860, width: '100%', margin: '0 auto'
      }}>
        {messages.map((msg, i) => renderMessage(msg, i))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff' }} />
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f5f5f5' }}>
              <Space>
                <Spin size="small" />
                <Text type="secondary">正在分析您的需求...</Text>
              </Space>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '16px 24px', background: '#fff', borderTop: '1px solid #eee'
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <Input.TextArea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述您找家教的需求，例如：初二的男孩，数学基础薄弱，需要一位耐心细致的老师..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading || !sessionId}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim() || !sessionId}
            style={{ height: 40 }}
          >
            发送
          </Button>
        </div>
      </div>

      <BookingModal
        open={bookingOpen}
        teacher={bookingTeacher}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `预约请求已成功提交！${bookingTeacher?.fullName || '老师'}会尽快确认。您可以在"我的预约"页面查看预约状态。`,
            time: new Date().toISOString()
          }]);
        }}
      />
    </div>
  );
};

export default ChatPage;