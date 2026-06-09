import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loading, initAuth, getCaptcha } = useAuthStore();
  const [activeTab, setActiveTab] = useState('login');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [registerForm] = Form.useForm();

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const data = await getCaptcha();
      setCaptchaImage(data.captchaImage);
      setCaptchaKey(data.captchaKey);
      registerForm.setFieldValue('captchaCode', '');
    } catch {
      setCaptchaImage('');
      setCaptchaKey('');
      message.error('获取验证码失败，请刷新重试');
    } finally {
      setCaptchaLoading(false);
    }
  }, [getCaptcha, registerForm]);

  useEffect(() => {
    if (activeTab === 'register') {
      loadCaptcha();
    }
  }, [activeTab, loadCaptcha]);

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      initAuth();
      message.success('登录成功');
      navigate('/');
    } catch {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  const handleRegister = async (values: { username: string; password: string; nickname: string; captchaCode: string }) => {
    if (!captchaKey) {
      message.error('验证码未加载，请刷新验证码后重试');
      loadCaptcha();
      return;
    }
    try {
      await register(values.username, values.password, values.nickname, captchaKey, values.captchaCode);
      initAuth();
      message.success('注册成功');
      navigate('/');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '注册失败，请稍后重试';
      message.error(msg);
      loadCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-retro-brown-dark flex items-center justify-center relative">
      <div className="absolute left-0 top-0 bottom-0 film-perforations opacity-20" />
      <div className="absolute right-0 top-0 bottom-0 film-perforations opacity-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-retro-gold mb-2">电影盲盒</h1>
          <p className="text-retro-gold-dark text-sm tracking-[0.3em]">CINEMA BLIND BOX</p>
        </div>

        <div className="retro-card rounded-xl p-8">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: <span className="text-retro-cream-dark">登录</span>,
                children: (
                  <Form onFinish={handleLogin} layout="vertical" size="large">
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input prefix={<UserOutlined className="text-retro-gold-dark" />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password prefix={<LockOutlined className="text-retro-gold-dark" />} placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block loading={loading} className="!h-11">
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: <span className="text-retro-cream-dark">注册</span>,
                children: (
                  <Form form={registerForm} onFinish={handleRegister} layout="vertical" size="large">
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input prefix={<UserOutlined className="text-retro-gold-dark" />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
                      <Input prefix={<MailOutlined className="text-retro-gold-dark" />} placeholder="昵称" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password prefix={<LockOutlined className="text-retro-gold-dark" />} placeholder="密码" />
                    </Form.Item>
                    <Form.Item
                      name="captchaCode"
                      rules={[
                        { required: true, message: '请输入验证码' },
                        { len: 4, message: '验证码为4位字符' },
                      ]}
                    >
                      <div className="flex gap-2">
                        <Input
                          prefix={<SafetyOutlined className="text-retro-gold-dark" />}
                          placeholder="验证码"
                          maxLength={4}
                          disabled={!captchaKey}
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          {captchaImage && (
                            <img
                              src={captchaImage}
                              alt="captcha"
                              className="h-9 rounded cursor-pointer"
                              onClick={loadCaptcha}
                              title="点击刷新验证码"
                            />
                          )}
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={loadCaptcha}
                            size="small"
                            loading={captchaLoading}
                            className="shrink-0"
                          />
                        </div>
                      </div>
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        disabled={!captchaKey}
                        className="!h-11"
                      >
                        注册
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </div>
      </motion.div>
    </div>
  );
}
