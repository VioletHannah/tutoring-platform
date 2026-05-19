import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Select, message, Modal, Space, Input, Typography, Empty } from 'antd';
import { MessageOutlined, SearchOutlined } from '@ant-design/icons';
import { useBookingStore } from '../../store/bookingStore';
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from '../../utils/constants';

const { Title } = Typography;

const TeacherBookings = () => {
  const navigate = useNavigate();
  const { bookings, pagination, loading, getMyBookings, acceptBooking, rejectBooking, completeBooking } = useBookingStore();
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, page]);

  const fetchBookings = () => {
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    getMyBookings(params);
  };

  const handleAccept = (id) => {
    let replyText = '';
    Modal.confirm({
      title: '确认接受预约',
      content: (
        <Input.TextArea
          rows={3}
          placeholder="给学生的留言（选填）"
          onChange={(e) => { replyText = e.target.value; }}
        />
      ),
      okText: '确认接受',
      cancelText: '再想想',
      onOk: async () => {
        const result = await acceptBooking(id, replyText);
        if (result.success) {
          message.success('预约已接受');
          fetchBookings();
        } else {
          message.error(result.error?.response?.data?.message || '操作失败');
        }
      }
    });
  };

  const handleReject = (id) => {
    let replyText = '';
    Modal.confirm({
      title: '确认拒绝预约',
      content: (
        <Input.TextArea
          rows={3}
          placeholder="拒绝原因（必填）"
          onChange={(e) => { replyText = e.target.value; }}
        />
      ),
      okText: '确认拒绝',
      cancelText: '再想想',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!replyText.trim()) {
          message.warning('请填写拒绝原因');
          return Promise.reject();
        }
        const result = await rejectBooking(id, replyText);
        if (result.success) {
          message.success('预约已拒绝');
          fetchBookings();
        } else {
          message.error(result.error?.response?.data?.message || '操作失败');
        }
      }
    });
  };

  const handleComplete = (id) => {
    Modal.confirm({
      title: '确认完成课程',
      content: '确认后该预约将标记为已完成。',
      okText: '确认完成',
      onOk: async () => {
        const result = await completeBooking(id);
        if (result.success) {
          message.success('课程已完成');
          fetchBookings();
        } else {
          message.error(result.error?.response?.data?.message || '操作失败');
        }
      }
    });
  };

  const statusColor = (status) => {
    const map = { pending: 'orange', accepted: 'blue', rejected: 'red', completed: 'green', cancelled: 'default' };
    return map[status] || 'default';
  };

  const columns = [
    {
      title: '学生',
      dataIndex: ['student', 'username'],
      key: 'student',
      render: (text, record) => {
        const student = record.student;
        return student?.username || `用户#${record.studentId}`;
      }
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '日期',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
    },
    {
      title: '时间',
      key: 'time',
      render: (_, record) => `${record.startTime?.slice(0, 5)} - ${record.endTime?.slice(0, 5)}`
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      render: (v) => v || '-'
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v) => v ? `¥${v}` : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{BOOKING_STATUS_LABELS[status]}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space wrap>
          {record.status === BOOKING_STATUS.PENDING && (
            <>
              <Button
                type="link"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => navigate(`/messages/students/${record.studentId}`)}
              >
                沟通
              </Button>
              <Button type="link" size="small" onClick={() => handleAccept(record.id)}>
                接受
              </Button>
              <Button type="link" size="small" danger onClick={() => handleReject(record.id)}>
                拒绝
              </Button>
            </>
          )}
          {record.status === BOOKING_STATUS.ACCEPTED && (
            <Button type="link" size="small" onClick={() => handleComplete(record.id)}>
              完成
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <Title level={3} style={{ marginBottom: 24 }}>预约管理</Title>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="筛选状态"
              allowClear
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
            >
              {Object.entries(BOOKING_STATUS_LABELS).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v}</Select.Option>
              ))}
            </Select>
            <Button icon={<SearchOutlined />} onClick={() => fetchBookings()}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="暂无预约请求" />
          }}
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.limit,
            onChange: setPage
          }}
        />
      </Card>
    </div>
  );
};

export default TeacherBookings;
