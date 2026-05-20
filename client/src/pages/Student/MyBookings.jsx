import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Select, message, Modal, Space, Typography, Empty, Rate, Input } from 'antd';
import { SearchOutlined, StarOutlined } from '@ant-design/icons';
import { useBookingStore } from '../../store/bookingStore';
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from '../../utils/constants';

const { Title } = Typography;

const MyBookings = () => {
  const navigate = useNavigate();
  const { bookings, pagination, loading, getMyBookings, cancelBooking, submitReview } = useBookingStore();
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [page, setPage] = useState(1);
  const [reviewModal, setReviewModal] = useState({ open: false, bookingId: null });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, page]);

  const fetchBookings = () => {
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    getMyBookings(params);
  };

  const handleCancel = (id) => {
    Modal.confirm({
      title: '确认取消预约',
      content: '取消后如需重约需重新提交申请。',
      okText: '确认取消',
      cancelText: '再想想',
      onOk: async () => {
        const result = await cancelBooking(id);
        if (result.success) {
          message.success('预约已取消');
          fetchBookings();
        } else {
          message.error(result.error?.response?.data?.message || '取消失败');
        }
      }
    });
  };

  const handleOpenReview = (bookingId) => {
    setReviewModal({ open: true, bookingId });
    setReviewRating(5);
    setReviewText('');
  };

  const handleRebook = (record) => {
    navigate(`/teachers/${record.teacherId}?book=1`, {
      state: {
        rebookFrom: {
          subject: record.subject,
          bookingDate: record.bookingDate,
          startTime: record.startTime,
          endTime: record.endTime,
          location: record.location,
          note: record.note
        }
      }
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      message.warning('请选择评分');
      return;
    }
    setSubmitting(true);
    const result = await submitReview(reviewModal.bookingId, {
      rating: reviewRating,
      review: reviewText.trim() || undefined
    });
    setSubmitting(false);
    if (result.success) {
      message.success('评价提交成功，感谢您的反馈！');
      setReviewModal({ open: false, bookingId: null });
      fetchBookings();
    } else {
      message.error(result.error?.response?.data?.message || '评价提交失败');
    }
  };

  const statusColor = (status) => {
    const map = { pending: 'orange', accepted: 'blue', rejected: 'red', completed: 'green', cancelled: 'default' };
    return map[status] || 'default';
  };

  const columns = [
    {
      title: '教师',
      dataIndex: ['teacher', 'fullName'],
      key: 'teacher',
      render: (_, record) => (
        record.teacher?.teacherProfile?.fullName ||
        record.teacher?.username ||
        `教师#${record.teacherId}`
      )
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
        <Space>
          {(record.status === BOOKING_STATUS.PENDING || record.status === BOOKING_STATUS.ACCEPTED) && (
            <Button type="link" danger size="small" onClick={() => handleCancel(record.id)}>
              取消
            </Button>
          )}
          {record.status === BOOKING_STATUS.COMPLETED && !record.studentRating && (
            <Button type="link" size="small" icon={<StarOutlined />} onClick={() => handleOpenReview(record.id)}>
              评价
            </Button>
          )}
          {record.status === BOOKING_STATUS.COMPLETED && record.studentRating && (
            <Space size={4}>
              <Rate disabled value={record.studentRating} style={{ fontSize: 14 }} />
            </Space>
          )}
          {record.status === BOOKING_STATUS.REJECTED && (
            <Button type="link" size="small" onClick={() => navigate(`/teachers/${record.teacherId}`)}>
              重新选择教师
            </Button>
          )}
          {record.status === BOOKING_STATUS.CANCELLED && (
            <Button type="link" size="small" onClick={() => handleRebook(record)}>
              重新预约
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <Title level={3} style={{ marginBottom: 24 }}>我的预约</Title>

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
            <Button type="primary" onClick={() => navigate('/teachers')}>
              浏览教师
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="暂无预约记录">
              <Button type="primary" onClick={() => navigate('/teachers')}>去浏览教师</Button>
            </Empty>
          }}
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.limit,
            onChange: setPage
          }}
        />
      </Card>

      <Modal
        title="课程评价"
        open={reviewModal.open}
        onOk={handleSubmitReview}
        onCancel={() => setReviewModal({ open: false, bookingId: null })}
        confirmLoading={submitting}
        okText="提交评价"
      >
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>给老师打个分吧</div>
          <Rate value={reviewRating} onChange={setReviewRating} style={{ fontSize: 28 }} />
        </div>
        <Input.TextArea
          rows={3}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="写下您的评价（选填）"
        />
      </Modal>
    </div>
  );
};

export default MyBookings;
