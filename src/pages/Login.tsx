import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loading, initAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      initAuth();
      message.success('登录成功');
      navigate('/');
    } catch {}
  };

  const handleRegister = async (values: { username: string; password: string; nickname: string }) => {
    try {
      await register(values.username, values.password, values.nickname);
      initAuth();
      message.success('注册成功');
      navigate('/');
    } catch {}
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
                  <Form onFinish={handleRegister} layout="vertical" size="large">
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input prefix={<UserOutlined className="text-retro-gold-dark" />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
                      <Input prefix={<MailOutlined className="text-retro-gold-dark" />} placeholder="昵称" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password prefix={<LockOutlined className="text-retro-gold-dark" />} placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block loading={loading} className="!h-11">
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
