import { useState } from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Input, message, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import { useBookingStore } from '../store/bookingStore';
import { SUBJECTS } from '../utils/constants';

const BookingModal = ({ open, teacher, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createBooking } = useBookingStore();

  const handleSubmit = async (values) => {
    setLoading(true);
    const data = {
      teacherId: teacher.userId,
      subject: values.subject,
      bookingDate: values.bookingDate.format('YYYY-MM-DD'),
      startTime: values.startTime.format('HH:mm:ss'),
      endTime: values.endTime.format('HH:mm:ss'),
      location: values.location || undefined,
      note: values.note || undefined
    };

    const result = await createBooking(data);
    setLoading(false);

    if (result.success) {
      message.success('预约请求已发送，请等待教师确认');
      form.resetFields();
      onClose();
      onSuccess?.();
    } else {
      message.error(result.error?.response?.data?.message || '预约失败，请重试');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const subjects = teacher?.subjects?.length ? teacher.subjects : SUBJECTS;

  return (
    <Modal
      title="预约课程"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="提交预约"
      cancelText="取消"
      width={560}
      destroyOnClose
    >
      {teacher && (
        <Descriptions size="small" column={2} style={{ marginBottom: 20 }}>
          <Descriptions.Item label="教师">{teacher.fullName}</Descriptions.Item>
          <Descriptions.Item label="课时费">
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{teacher.hourlyRate}/小时</span>
          </Descriptions.Item>
          <Descriptions.Item label="擅长科目">
            {teacher.subjects?.map(s => <Tag key={s} color="blue">{s}</Tag>)}
          </Descriptions.Item>
          <Descriptions.Item label="教龄">{teacher.teachingExperience || 0}年</Descriptions.Item>
        </Descriptions>
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="subject"
          label="辅导科目"
          rules={[{ required: true, message: '请选择辅导科目' }]}
        >
          <Select placeholder="选择科目" showSearch>
            {subjects.map(s => (
              <Select.Option key={s} value={s}>{s}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="bookingDate"
          label="预约日期"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="startTime"
          label="开始时间"
          rules={[{ required: true, message: '请选择开始时间' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="结束时间"
          rules={[{ required: true, message: '请选择结束时间' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} />
        </Form.Item>

        <Form.Item
          name="location"
          label="上课地点"
        >
          <Input placeholder="线下地址或线上链接" />
        </Form.Item>

        <Form.Item
          name="note"
          label="备注信息"
        >
          <Input.TextArea rows={3} placeholder="例如：学生年级、学习基础、特殊需求等" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookingModal;