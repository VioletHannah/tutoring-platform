import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Empty, Input, List, message, Space, Spin, Tag, Typography } from 'antd';
import { CalendarOutlined, MessageOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { chatAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { USER_ROLES } from '../../utils/constants';
import BookingModal from '../../components/BookingModal';

const { Text, Paragraph } = Typography;
const CHAT_POLL_INTERVAL = 3000;

const quickMessages = [
  '老师您好，我想先了解一下您的上课方式和可约时间。',
  '请问可以先沟通孩子目前的学习情况，再决定是否预约吗？',
  '老师您好，想咨询一下试听或首次课安排。'
];

const formatTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TeacherChat = () => {
  const { teacherId, studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const initializedParticipantRef = useRef(null);

  const activeThread = useMemo(
    () => threads.find(thread => thread.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const selectedTeacher = useMemo(() => {
    if (!activeThread?.teacher) return null;
    const profile = activeThread.teacher.teacherProfile || {};
    return {
      ...profile,
      userId: activeThread.teacher.id,
      fullName: profile.fullName || activeThread.teacher.username,
      username: activeThread.teacher.username,
      email: activeThread.teacher.email
    };
  }, [activeThread]);

  const fetchThreads = async (preferredThreadId, options = {}) => {
    const { silent = false } = options;
    if (!silent) {
      setLoadingThreads(true);
    }
    try {
      const res = await chatAPI.getThreads();
      const nextThreads = res.data || [];
      setThreads(nextThreads);
      if (preferredThreadId) {
        setActiveThreadId(preferredThreadId);
      } else if (!activeThreadId && nextThreads.length > 0) {
        setActiveThreadId(nextThreads[0].id);
      }
    } catch {
      if (silent) return;
      message.error('获取沟通列表失败');
    } finally {
      if (!silent) {
        setLoadingThreads(false);
      }
    }
  };

  const fetchMessages = async (threadId, options = {}) => {
    const { silent = false } = options;
    if (!threadId) return;

    if (!silent) {
      setLoadingMessages(true);
    }

    try {
      const res = await chatAPI.getMessages(threadId);
      setMessages(res.data.messages || []);
    } catch {
      if (silent) return;
      message.error('获取消息失败');
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (teacherId && user?.role === USER_ROLES.STUDENT && initializedParticipantRef.current !== `teacher:${teacherId}`) {
        initializedParticipantRef.current = `teacher:${teacherId}`;
        setLoadingThreads(true);
        try {
          const res = await chatAPI.createThread({ teacherId: Number(teacherId) });
          await fetchThreads(res.data.id);
        } catch {
          message.error('发起沟通失败');
          setLoadingThreads(false);
        }
        return;
      }

      if (studentId && user?.role === USER_ROLES.TEACHER && initializedParticipantRef.current !== `student:${studentId}`) {
        initializedParticipantRef.current = `student:${studentId}`;
        setLoadingThreads(true);
        try {
          const res = await chatAPI.createThread({ studentId: Number(studentId) });
          await fetchThreads(res.data.id);
        } catch {
          message.error('发起沟通失败');
          setLoadingThreads(false);
        }
        return;
      }

      fetchThreads();
    };

    initialize();
  }, [teacherId, studentId, user?.role]);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await chatAPI.getMessages(activeThreadId);
        setMessages(res.data.messages || []);
      } catch {
        message.error('获取消息失败');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeThreadId]);

  useEffect(() => {
    if (!activeThreadId) return undefined;

    const timer = window.setInterval(() => {
      fetchMessages(activeThreadId, { silent: true });
      fetchThreads(activeThreadId, { silent: true });
    }, CHAT_POLL_INTERVAL);

    return () => window.clearInterval(timer);
  }, [activeThreadId]);

  const isNearBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150;
  };

  useEffect(() => {
    if (isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getThreadTitle = (thread) => {
    if (user?.role === USER_ROLES.TEACHER) {
      return thread.student?.username || `学生#${thread.studentId}`;
    }

    return thread.teacher?.teacherProfile?.fullName || thread.teacher?.username || `老师#${thread.teacherId}`;
  };

  const handleSend = async (content = input) => {
    const text = content.trim();
    if (!text || !activeThreadId) return;

    setSending(true);
    try {
      const res = await chatAPI.sendMessage(activeThreadId, text);
      setMessages(prev => [...prev, res.data]);
      setInput('');
      fetchThreads(activeThreadId);
    } catch {
      message.error('发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderThreadList = () => (
    <Card
      title="我的沟通"
      style={{ height: '100%' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflowY: 'auto' }}
    >
      <Spin spinning={loadingThreads}>
        {threads.length === 0 ? (
          <Empty
            description="暂无沟通记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '48px 12px' }}
          >
            {user?.role === USER_ROLES.STUDENT && (
              <Button type="primary" onClick={() => navigate('/teachers')}>
                去找老师
              </Button>
            )}
          </Empty>
        ) : (
          <List
            dataSource={threads}
            renderItem={(thread) => {
              const active = thread.id === activeThreadId;
              const lastMessage = thread.lastMessage?.content || '还没有消息，先打个招呼吧';
              return (
                <List.Item
                  onClick={() => setActiveThreadId(thread.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '14px 16px',
                    background: active ? '#e6f4ff' : '#fff',
                    borderInlineStart: active ? '3px solid #1677ff' : '3px solid transparent'
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space size={8}>
                        <Text strong>{getThreadTitle(thread)}</Text>
                        {user?.role === USER_ROLES.STUDENT && thread.teacher?.teacherProfile?.hourlyRate && (
                          <Tag color="red">¥{thread.teacher.teacherProfile.hourlyRate}/小时</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0, color: '#666' }}>
                        {lastMessage}
                      </Paragraph>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Spin>
    </Card>
  );

  const renderChatPanel = () => {
    if (!activeThread) {
      return (
        <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="选择一条沟通记录开始聊天" />
        </Card>
      );
    }

    return (
      <Card
        style={{ height: '100%' }}
        bodyStyle={{ height: '100%', padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <Space>
            <Badge status="success" />
            <div>
              <Text strong style={{ fontSize: 16 }}>{getThreadTitle(activeThread)}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user?.role === USER_ROLES.STUDENT ? '先沟通清楚，再决定是否预约' : '学生咨询'}
                </Text>
              </div>
            </div>
          </Space>

          {user?.role === USER_ROLES.STUDENT && selectedTeacher && (
            <Space wrap>
              <Button
                icon={<UserOutlined />}
                onClick={() => navigate(`/teachers/${selectedTeacher.userId}`)}
              >
                查看老师
              </Button>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => setBookingOpen(true)}
              >
                直接预约
              </Button>
            </Space>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f5f7fb' }}>
          {loadingMessages ? (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <Spin />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ paddingTop: 60 }}>
              <Empty description="还没有消息" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                {user?.role === USER_ROLES.STUDENT && (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {quickMessages.map(item => (
                      <Button key={item} onClick={() => handleSend(item)} icon={<MessageOutlined />}>
                        {item}
                      </Button>
                    ))}
                  </Space>
                )}
              </Empty>
            </div>
          ) : (
            messages.map(item => {
              const isMine = item.senderId === user?.id;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: 14
                  }}
                >
                  <div style={{
                    maxWidth: '72%',
                    display: 'flex',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    gap: 10,
                    alignItems: 'flex-start'
                  }}>
                    <Avatar icon={<UserOutlined />} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: isMine ? '#1677ff' : '#fff',
                        color: isMine ? '#fff' : '#222',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                      }}>
                        {item.content}
                      </div>
                      <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12, textAlign: isMine ? 'right' : 'left' }}>
                        {item.sender?.username || ''} {formatTime(item.createdAt)}
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入想和对方沟通的问题..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              maxLength={1000}
              disabled={sending}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSend()}
              loading={sending}
              disabled={!input.trim()}
              style={{ height: 40 }}
            >
              发送
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <div className="teacher-chat-layout">
        {renderThreadList()}
        {renderChatPanel()}
      </div>

      <BookingModal
        open={bookingOpen}
        teacher={selectedTeacher}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
};

export default TeacherChat;
