import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  VideoCameraOutlined,
  GiftOutlined,
  HeartOutlined,
  HistoryOutlined,
  ShareAltOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import FilmGrain from '@/components/FilmGrain';

const navItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/movies', icon: <VideoCameraOutlined />, label: '电影库' },
  { key: '/blindbox', icon: <GiftOutlined />, label: '开盲盒' },
  { key: '/lists', icon: <UnorderedListOutlined />, label: '片单' },
  { key: '/collection', icon: <HeartOutlined />, label: '我的收藏' },
  { key: '/history', icon: <HistoryOutlined />, label: '观影记录' },
  { key: '/share', icon: <ShareAltOutlined />, label: '好友分享' },
  { key: '/stats', icon: <BarChartOutlined />, label: '数据统计' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, initAuth, logout } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  const dropdownItems = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: user?.nickname || user?.username || '用户' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') handleLogout();
    },
  };

  return (
    <div className="flex min-h-screen bg-retro-brown-dark">
      <FilmGrain />

      <aside className="w-[72px] lg:w-[200px] bg-retro-brown border-r border-retro-gold-dark/50 flex flex-col shrink-0 fixed h-full z-40">
        <div className="flex items-center justify-center h-16 border-b border-retro-gold-dark/30">
          <div className="hidden lg:block">
            <h1 className="font-display text-retro-gold text-lg tracking-wider">电影盲盒</h1>
            <p className="text-retro-gold-dark text-[10px] tracking-widest text-center">CINEMA BOX</p>
          </div>
          <div className="lg:hidden text-retro-gold text-xl">🎬</div>
        </div>

        <div className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.key ||
              (item.key !== '/' && location.pathname.startsWith(item.key));
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded cursor-pointer transition-all duration-200
                  ${isActive
                    ? 'bg-retro-crimson/20 text-retro-gold border-l-2 border-retro-crimson'
                    : 'text-retro-cream-dark hover:bg-retro-brown-light hover:text-retro-gold'
                  }`}
              >
                <span className={`text-lg ${isActive ? 'text-retro-crimson' : ''}`}>{item.icon}</span>
                <span className="hidden lg:block text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-retro-gold-dark/30 p-3">
          {isLoggedIn ? (
            <Dropdown menu={dropdownItems} placement="topRight">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  className="border-2 border-retro-gold-dark"
                />
                <span className="hidden lg:block text-retro-cream-dark text-xs truncate max-w-[100px]">
                  {user?.nickname || user?.username}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 cursor-pointer text-retro-gold-dark hover:text-retro-gold"
            >
              <Avatar size={36} icon={<UserOutlined />} className="border-2 border-retro-gold-dark" />
              <span className="hidden lg:block text-xs">登录</span>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 ml-[72px] lg:ml-[200px]">
        <div className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
