import { useState } from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Input, InputNumber, message, Descriptions, Tag, Radio, Button, Table, Alert, Checkbox, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useBookingStore } from '../store/bookingStore';
import { SUBJECTS, WEEKDAY_OPTIONS, DURATION_OPTIONS, SESSIONS_PER_WEEK_OPTIONS, TIME_RANGE_PRESETS } from '../utils/constants';

const BookingModal = ({ open, teacher, onClose, onSuccess }) => {
  const [manualForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState('manual'); // 'manual' or 'auto'
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndices, setSelectedSuggestionIndices] = useState([]);
  const [generatedSummary, setGeneratedSummary] = useState(null);

  const { createBooking, suggestSchedule, confirmSchedule } = useBookingStore();

  const handleManualSubmit = async (values) => {
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
      handleClose();
      onSuccess?.();
    } else {
      message.error(result.error?.response?.data?.message || '预约失败，请重试');
    }
  };

  const handleGenerateSchedule = async (values) => {
    setLoading(true);

    // Parse preferredTimeRanges from selected format "HH:mm:00-HH:mm:00" to array of objects
    const timeRanges = (values.preferredTimeRanges || []).map(rangeStr => {
      const [start, end] = rangeStr.split('-');
      return { start, end };
    });

    const data = {
      teacherId: teacher.userId,
      subject: values.subject,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
      durationMinutes: values.durationMinutes,
      sessionsPerWeek: values.sessionsPerWeek,
      preferredWeekdays: values.preferredWeekdays || [],
      preferredTimeRanges: timeRanges,
      totalSessions: values.totalSessions || undefined,
      location: values.location || undefined,
      note: values.note || 'AI 自动排期'
    };

    const result = await suggestSchedule(data);
    setLoading(false);

    if (result.success) {
      setSuggestions(result.suggestions || []);
      setGeneratedSummary(result.summary || null);
      setSelectedSuggestionIndices(result.suggestions?.map((_, i) => i) || []);
      message.success(`成功生成 ${result.suggestions?.length || 0} 个推荐时段`);
    } else {
      message.error(result.error?.response?.data?.message || '生成推荐失败，请重试');
      setSuggestions([]);
      setGeneratedSummary(null);
    }
  };

  const handleConfirmSchedule = async () => {
    if (selectedSuggestionIndices.length === 0) {
      message.warning('请至少选择一个推荐时段');
      return;
    }

    setLoading(true);
    const values = await scheduleForm.validateFields();

    const scheduleItems = selectedSuggestionIndices.map(i => ({
      bookingDate: suggestions[i].bookingDate,
      startTime: suggestions[i].startTime,
      endTime: suggestions[i].endTime
    }));

    const data = {
      teacherId: teacher.userId,
      subject: values.confirmSubject || values.subject,
      scheduleItems,
      location: values.confirmLocation || values.location,
      note: values.confirmNote || values.note || 'AI 自动排期'
    };

    const result = await confirmSchedule(data);
    setLoading(false);

    if (result.success) {
      message.success(`成功创建 ${result.bookings?.length || 0} 个预约请求，请等待教师确认`);
      handleClose();
      onSuccess?.();
    } else {
      message.error(result.error?.response?.data?.message || '创建预约失败，请重试');
    }
  };

  const handleClose = () => {
    manualForm.resetFields();
    scheduleForm.resetFields();
    setSuggestions([]);
    setSelectedSuggestionIndices([]);
    setGeneratedSummary(null);
    onClose();
  };

  const handleModeChange = (e) => {
    setBookingMode(e.target.value);
    setSuggestions([]);
    setSelectedSuggestionIndices([]);
    setGeneratedSummary(null);
  };

  const toggleSuggestionSelection = (index) => {
    if (selectedSuggestionIndices.includes(index)) {
      setSelectedSuggestionIndices(selectedSuggestionIndices.filter(i => i !== index));
    } else {
      setSelectedSuggestionIndices([...selectedSuggestionIndices, index]);
    }
  };

  const toggleAllSuggestions = (checked) => {
    if (checked) {
      setSelectedSuggestionIndices(suggestions.map((_, i) => i));
    } else {
      setSelectedSuggestionIndices([]);
    }
  };

  const subjects = teacher?.subjects?.length ? teacher.subjects : SUBJECTS;

  const suggestionColumns = [
    {
      title: '选择',
      dataIndex: 'selected',
      key: 'selected',
      width: 50,
      render: (_, __, index) => (
        <Checkbox
          checked={selectedSuggestionIndices.includes(index)}
          onChange={(e) => toggleSuggestionSelection(index)}
        />
      ),
      headerRender: () => (
        <Checkbox
          checked={selectedSuggestionIndices.length === suggestions.length && suggestions.length > 0}
          onChange={(e) => toggleAllSuggestions(e.target.checked)}
        />
      )
    },
    {
      title: '日期',
      dataIndex: 'bookingDate',
      key: 'bookingDate'
    },
    {
      title: '星期',
      key: 'weekday',
      render: (_, record) => WEEKDAY_OPTIONS.find(w => w.value === record.weekday)?.label || '-'
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime'
    },
    {
      title: '第几周',
      dataIndex: 'weekIndex',
      key: 'weekIndex'
    }
  ];

  return (
    <Modal
      title="预约课程"
      open={open}
      onCancel={handleClose}
      footer={null}
      confirmLoading={loading}
      width={700}
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

      <Radio.Group
        value={bookingMode}
        onChange={handleModeChange}
        style={{ marginBottom: 20 }}
      >
        <Radio.Button value="manual">手动预约</Radio.Button>
        <Radio.Button value="auto">AI 自动排期</Radio.Button>
      </Radio.Group>

      {bookingMode === 'manual' ? (
        <Form form={manualForm} layout="vertical" onFinish={handleManualSubmit}>
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              提交预约
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form form={scheduleForm} layout="vertical" onFinish={handleGenerateSchedule}>
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
            name="startDate"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="结束日期"
            rules={[{ required: true, message: '请选择结束日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="durationMinutes"
            label="每节课时长"
            rules={[{ required: true, message: '请选择课时长' }]}
            initialValue={90}
          >
            <Select placeholder="选择时长">
              {DURATION_OPTIONS.map(d => (
                <Select.Option key={d.value} value={d.value}>{d.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sessionsPerWeek"
            label="每周上课次数"
            rules={[{ required: true, message: '请选择每周次数' }]}
            initialValue={2}
          >
            <Select placeholder="选择次数">
              {SESSIONS_PER_WEEK_OPTIONS.map(s => (
                <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="preferredWeekdays"
            label="可接受的星期"
            rules={[{ required: true, message: '请至少选择一个星期' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择可接受的星期（默认周六、周日）"
              style={{ width: '100%' }}
              defaultValue={[6, 7]}
            >
              {WEEKDAY_OPTIONS.map(d => (
                <Select.Option key={d.value} value={d.value}>{d.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="preferredTimeRanges"
            label="可接受的时间段"
            rules={[{ required: true, message: '请至少选择一个时间段' }]}
            tooltip="可以添加多个时间段"
          >
            <Select
              mode="multiple"
              placeholder="选择可接受的时间段"
              style={{ width: '100%' }}
              optionLabelProp="label"
            >
              {TIME_RANGE_PRESETS.map((t, i) => (
                <Select.Option key={i} value={`${t.start}-${t.end}`} label={t.label}>
                  {t.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="totalSessions"
            label="总课次数（可选）"
            tooltip="如果填写，将优先生成指定次数；如果不填，按日期范围和每周次数生成"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如：8" />
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block icon={<PlusOutlined />}>
              生成推荐课表
            </Button>
          </Form.Item>

          {suggestions.length > 0 && (
            <>
              {generatedSummary && generatedSummary.generatedSessions < generatedSummary.requestedSessions && (
                <Alert
                  message={`可用时间不足，只生成了 ${generatedSummary.generatedSessions} 节课（请求 ${generatedSummary.requestedSessions} 节）`}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Card title="推荐课表" size="small" style={{ marginBottom: 16 }}>
                <Table
                  columns={suggestionColumns}
                  dataSource={suggestions.map((s, i) => ({ ...s, key: i, selected: selectedSuggestionIndices.includes(i) }))}
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                />
              </Card>

              {generatedSummary && (
                <Alert
                  message={`已生成 ${generatedSummary.generatedSessions} 节课，每节 ${generatedSummary.durationMinutes} 分钟`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Form.Item
                name="confirmSubject"
                label="确认科目"
                rules={[{ required: true, message: '请确认科目' }]}
                initialValue={scheduleForm.getFieldValue('subject')}
              >
                <Select placeholder="确认科目">
                  {subjects.map(s => (
                    <Select.Option key={s} value={s}>{s}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="confirmLocation"
                label="确认上课地点"
              >
                <Input placeholder="线下地址或线上链接" />
              </Form.Item>

              <Form.Item
                name="confirmNote"
                label="确认备注"
              >
                <Input.TextArea rows={2} placeholder="备注信息" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  onClick={handleConfirmSchedule}
                  loading={loading}
                  block
                  disabled={selectedSuggestionIndices.length === 0}
                >
                  确认预约 ({selectedSuggestionIndices.length} 节)
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default BookingModal;
