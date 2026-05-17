import { useEffect, useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Upload, message, Spin, Row, Col, Divider, Avatar, Image, Tag, Alert, Table, Popconfirm, Tooltip, Progress, Space } from 'antd';
import { UploadOutlined, UserOutlined, PlusOutlined, RobotOutlined, CheckCircleOutlined, DeleteOutlined, ReloadOutlined, FileTextOutlined, SafetyCertificateOutlined, BankOutlined, ExperimentOutlined, ReadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useTeacherStore } from '../../store/teacherStore';
import { teacherAPI } from '../../api';
import { UPLOAD_URL, SUBJECTS, GENDER_OPTIONS, MATERIAL_TYPES, MATERIAL_TYPE_LABELS, REVIEW_STATUS_CONFIG } from '../../utils/constants';

const { TextArea } = Input;

const MATERIAL_TYPE_ICONS = {
  certificate: <SafetyCertificateOutlined />,
  education: <BankOutlined />,
  experience: <ExperimentOutlined />,
  self_intro: <ReadOutlined />,
  other: <PaperClipOutlined />
};

const MATERIAL_TYPE_ICON_ELEMENTS = {
  certificate: <SafetyCertificateOutlined />,
  education: <BankOutlined />,
  experience: <ExperimentOutlined />,
  self_intro: <ReadOutlined />,
  other: <PaperClipOutlined />
};

const TeacherProfile = () => {
  const [form] = Form.useForm();
  const { myProfile, loading, getMyProfile, saveProfile } = useTeacherStore();
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [certUrls, setCertUrls] = useState([]);
  const [tags, setTags] = useState([]);
  const [highlights, setHighlights] = useState('');
  const [analyzedAt, setAnalyzedAt] = useState(null);

  // Material upload states
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialUploadOpen, setMaterialUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materialForm] = Form.useForm();

  useEffect(() => {
    loadProfile();
    loadMaterials();
  }, []);

  useEffect(() => {
    if (myProfile) {
      form.setFieldsValue(myProfile);
      setAvatarUrl(myProfile.avatarUrl);
      setCertUrls(myProfile.certificateUrls || []);
      setTags(myProfile.tags || []);
      setHighlights(myProfile.highlights || '');
      setAnalyzedAt(myProfile.analyzedAt);
    }
  }, [myProfile]);

  const loadProfile = async () => {
    const result = await getMyProfile();
    if (!result.success) {
      message.error('加载教师档案失败');
    }
  };

  const loadMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const res = await teacherAPI.getMyMaterials();
      setMaterials(res.data || []);
    } catch (err) {
      console.error('加载材料失败', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const result = await saveProfile(values);
    setSubmitting(false);
    if (result.success) {
      message.success('档案保存成功');
    } else {
      message.error(result.error?.response?.data?.message || '保存失败');
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await teacherAPI.analyzeProfile();
      const data = res.data;
      setTags(data.tags || []);
      setHighlights(data.highlights || '');
      setAnalyzedAt(data.analyzedAt);
      message.success('AI 分析完成，档案标签已更新');
      loadProfile();
    } catch (err) {
      message.error(err.response?.data?.message || '分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const res = await teacherAPI.uploadAvatar(file);
      const url = res.data.avatarUrl || res.data?.avatarUrl;
      setAvatarUrl(url);
      message.success('头像上传成功');
    } catch (err) {
      message.error(err.response?.data?.message || '头像上传失败');
    }
    return false;
  };

  const handleCertUpload = async (file) => {
    try {
      const res = await teacherAPI.uploadCertificates([file]);
      const urls = res.data.certificateUrls || res.data?.certificateUrls || [];
      setCertUrls(prev => [...prev, ...urls]);
      message.success('证书上传成功');
    } catch (err) {
      message.error(err.response?.data?.message || '证书上传失败');
    }
    return false;
  };

  // Material upload handlers
  const handleMaterialUpload = async (values) => {
    const { file, materialType, title } = values;
    if (!file) {
      message.error('请选择要上传的文件');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('materialType', materialType);
      formData.append('title', title);

      const res = await teacherAPI.uploadMaterial(formData);

      message.info(res.data.message || '材料上传成功，AI 已完成初步审核');
      materialForm.resetFields();
      setMaterialUploadOpen(false);
      loadMaterials();
    } catch (err) {
      message.error(err.response?.data?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleReviewAgain = async (materialId) => {
    try {
      await teacherAPI.reviewAgain(materialId);
      message.success('AI 重新审核完成');
      loadMaterials();
    } catch (err) {
      message.error(err.response?.data?.message || '重新审核失败');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await teacherAPI.deleteMaterial(materialId);
      message.success('材料删除成功');
      loadMaterials();
    } catch (err) {
      message.error(err.response?.data?.message || '删除失败');
    }
  };

  const renderStatusTag = (status) => {
    const config = REVIEW_STATUS_CONFIG[status] || { color: 'default', label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const renderScoreBar = (score) => {
    if (score === null || score === undefined) return '-';
    let color = '#52c41a';
    if (score < 50) color = '#ff4d4f';
    else if (score < 80) color = '#faad14';
    return <Progress percent={score} size="small" status={score >= 80 ? 'success' : 'exception'} strokeColor={color} style={{ width: 100 }} />;
  };

  const materialColumns = [
    {
      title: '类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 100,
      render: (type) => (
        <Space>
          {MATERIAL_TYPE_ICON_ELEMENTS[type] || <FileTextOutlined />}
          {MATERIAL_TYPE_LABELS[type] || type}
        </Space>
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 110,
      render: renderStatusTag
    },
    {
      title: 'AI 评分',
      dataIndex: 'aiScore',
      key: 'aiScore',
      width: 130,
      render: renderScoreBar
    },
    {
      title: 'AI 摘要',
      dataIndex: 'aiSummary',
      key: 'aiSummary',
      ellipsis: true,
      render: (text) => text ? <Tooltip title={text}>{text.substring(0, 50)}...</Tooltip> : '-'
    },
    {
      title: 'AI 标签',
      dataIndex: 'aiTags',
      key: 'aiTags',
      width: 180,
      render: (tags) => (
        <span>
          {(tags || []).slice(0, 3).map((tag, i) => (
            <Tag key={i} color="blue" style={{ marginBottom: 2 }}>{tag}</Tag>
          ))}
          {(tags || []).length > 3 && <Tag color="default">+{tags.length - 3}</Tag>}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleReviewAgain(record.id)}
          >
            重审
          </Button>
          <Popconfirm
            title="确定要删除此材料吗？"
            onConfirm={() => handleDeleteMaterial(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (loading && !myProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 134px)' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <Card title="编辑教师档案" extra={
        <Button onClick={() => form.submit()} type="primary" loading={submitting}>
          保存档案
        </Button>
      }>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              subjects: [],
              availableTimes: []
            }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label="真实姓名"
                  rules={[{ required: true, message: '请输入真实姓名' }]}
                >
                  <Input placeholder="请输入真实姓名" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="gender" label="性别">
                  <Select placeholder="请选择性别" allowClear>
                    {GENDER_OPTIONS.map(o => (
                      <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="age" label="年龄">
                  <InputNumber min={18} max={100} style={{ width: '100%' }} placeholder="请输入年龄" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="education" label="学历">
                  <Select placeholder="请选择最高学历" allowClear>
                    <Select.Option value="高中">高中</Select.Option>
                    <Select.Option value="大专">大专</Select.Option>
                    <Select.Option value="本科">本科</Select.Option>
                    <Select.Option value="硕士">硕士</Select.Option>
                    <Select.Option value="博士">博士</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="teachingExperience" label="教学经验（年）">
                  <InputNumber min={0} max={50} style={{ width: '100%' }} placeholder="请输入教学年限" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="hourlyRate" label="课时费（元/小时）">
                  <InputNumber min={0} max={10000} style={{ width: '100%' }} placeholder="请输入课时费" prefix="¥" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="subjects" label="擅长科目">
              <Select mode="multiple" placeholder="请选择擅长科目" allowClear>
                {SUBJECTS.map(s => (
                  <Select.Option key={s} value={s}>{s}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="introduction" label="个人简介">
              <TextArea rows={4} placeholder="请介绍您的教学风格、教学理念、教学成果等" />
            </Form.Item>

            <Form.Item name="isOnline" label="在线状态" valuePropName="checked" initialValue={true}>
              <Select placeholder="选择状态">
                <Select.Option value={true}>在线（接受预约）</Select.Option>
                <Select.Option value={false}>离线（暂停接单）</Select.Option>
              </Select>
            </Form.Item>

            <Divider>头像设置</Divider>
            <Row gutter={24} align="middle">
              <Col>
                <Avatar
                  size={100}
                  src={avatarUrl ? `${UPLOAD_URL}${avatarUrl}` : null}
                  icon={!avatarUrl && <UserOutlined />}
                />
              </Col>
              <Col>
                <Upload
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>上传头像</Button>
                </Upload>
              </Col>
            </Row>

            <Divider>证书资质</Divider>
            <Image.PreviewGroup>
              <Row gutter={[8, 8]}>
                {certUrls.map((url, i) => (
                  <Col key={i}>
                    <Image
                      src={`${UPLOAD_URL}${url}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  </Col>
                ))}
                <Col>
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleCertUpload}
                    accept="image/*"
                  >
                    <div style={{
                      width: 100, height: 100, border: '1px dashed #d9d9d9',
                      borderRadius: 4, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer'
                    }}>
                      <PlusOutlined style={{ fontSize: 24, color: '#999' }} />
                    </div>
                  </Upload>
                </Col>
              </Row>
            </Image.PreviewGroup>

          <Divider>AI 智能分析</Divider>
            {highlights ? (
              <Alert
                type="success"
                icon={<CheckCircleOutlined />}
                message={analyzedAt ? `最近分析时间：${new Date(analyzedAt).toLocaleString('zh-CN')}` : '已分析'}
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>{highlights}</div>
                    <div>
                      {tags.map((tag, i) => <Tag key={i} color="blue">{tag}</Tag>)}
                    </div>
                  </div>
                }
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                type="info"
                message="尚未进行 AI 分析"
                description="点击下方按钮，AI 将自动分析您的档案，生成教学风格标签和亮点总结。"
                style={{ marginBottom: 16 }}
              />
            )}
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleAnalyze}
              loading={analyzing}
            >
              {highlights ? '重新分析' : 'AI 智能分析'}
            </Button>
          </Form>
        </Spin>
      </Card>

      {/* Material Upload Section */}
      <Card
        title="资质材料与 AI 审核"
        extra={
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setMaterialUploadOpen(true)}
          >
            上传材料
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        <Alert
          type="info"
          message="温馨提示"
          description="当前版本可能无法完整识别图片/PDF 文字，平台会基于文件信息和材料类型给出初步审核建议。如需完整审核，请上传文本文件或等待人工复核。"
          style={{ marginBottom: 16 }}
        />

        <Spin spinning={materialsLoading}>
          <Table
            columns={materialColumns}
            dataSource={materials}
            rowKey="id"
            pagination={{ pageSize: 10, size: 'small' }}
            size="small"
            locale={{ emptyText: '暂无上传材料' }}
          />
        </Spin>

        {/* Upload Modal */}
        {materialUploadOpen && (
          <div style={{ marginTop: 16 }}>
            <Form
              form={materialForm}
              layout="vertical"
              onFinish={handleMaterialUpload}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="materialType"
                    label="材料类型"
                    rules={[{ required: true, message: '请选择材料类型' }]}
                  >
                    <Select placeholder="请选择材料类型">
                      {MATERIAL_TYPES.map(t => (
                        <Select.Option key={t.value} value={t.value}>
                          {t.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="title"
                    label="材料标题"
                    rules={[{ required: true, message: '请输入材料标题' }]}
                  >
                    <Input placeholder="如：高中数学教师资格证" maxLength={100} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="file"
                label="选择文件"
                rules={[{ required: true, message: '请选择要上传的文件' }]}
              >
                <Upload
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
                  maxCount={1}
                  beforeUpload={(file) => {
                    materialForm.setFieldValue('file', file);
                    return false;
                  }}
                  fileList={materialForm.getFieldValue('file') ? [materialForm.getFieldValue('file')] : []}
                  onRemove={() => {
                    materialForm.setFieldValue('file', null);
                  }}
                >
                  <Button icon={<UploadOutlined />}>选择文件（支持 JPG、PNG、WEBP、PDF、TXT，最大 10MB）</Button>
                </Upload>
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={uploading}>
                    上传并AI审核
                  </Button>
                  <Button onClick={() => { setMaterialUploadOpen(false); materialForm.resetFields(); }}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherProfile;