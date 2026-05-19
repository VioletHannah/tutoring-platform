import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { USER_ROLES } from '../../utils/constants';
import { getPostAuthRedirectPath } from '../../utils/authRedirect';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loading } = useAuthStore();
  const [form] = Form.useForm();

  const roleFromQuery = searchParams.get('role');
  const initialRole = Object.values(USER_ROLES).includes(roleFromQuery)
    ? roleFromQuery
    : undefined;

  const getRedirectPath = (role) => {
    const intent = searchParams.get('intent');
    const teacherId = searchParams.get('teacherId');

    if (role === USER_ROLES.STUDENT && teacherId && intent === 'chat') {
      return `/messages/teachers/${teacherId}`;
    }

    if (role === USER_ROLES.STUDENT && teacherId && intent === 'book') {
      return `/teachers/${teacherId}?book=1`;
    }

    return getPostAuthRedirectPath(role, { isNewUser: true });
  };

  const onFinish = async (values) => {
    const result = await register(values);

    if (result.success) {
      message.success('注册成功！');
      navigate(getRedirectPath(result.user?.role), { replace: true });
    } else {
      message.error(result.error?.response?.data?.message || '注册失败，请重试');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 134px)',
      background: '#f0f2f5',
      padding: '20px 0'
    }}>
      <Card title="用户注册" style={{ width: 500 }}>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          initialValues={{ role: initialRole }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名至少 3 个字符！' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号！' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号（可选）" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少 6 个字符！' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色！' }]}
          >
            <Select placeholder="请选择您的角色">
              <Select.Option value={USER_ROLES.STUDENT}>学生（需要家教）</Select.Option>
              <Select.Option value={USER_ROLES.TEACHER}>教师（提供家教）</Select.Option>
              <Select.Option value={USER_ROLES.INSTITUTION}>机构</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？ <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
