import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Empty } from 'antd';
import { motion } from 'framer-motion';
import useShareStore from '@/store/shareStore';
import ShareCard from '@/components/ShareCard';

export default function ShareView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { currentShare, loading, fetchShareByCode } = useShareStore();

  useEffect(() => {
    if (code) {
      fetchShareByCode(code);
    }
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-brown-dark flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentShare) {
    return (
      <div className="min-h-screen bg-retro-brown-dark flex items-center justify-center">
        <div className="text-center">
          <Empty description={<span className="text-retro-cream-dark">分享不存在或已过期</span>} />
          <Button type="primary" className="mt-4" onClick={() => navigate('/login')}>
            去登录
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-brown-dark flex items-center justify-center relative">
      <div className="absolute left-0 top-0 bottom-0 film-perforations opacity-20" />
      <div className="absolute right-0 top-0 bottom-0 film-perforations opacity-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-4"
      >
        <div className="text-center mb-6">
          <h1 className="font-display text-retro-gold text-2xl mb-1">电影盲盒推荐</h1>
          <p className="text-retro-gold-dark text-sm tracking-widest">CINEMA BLIND BOX</p>
        </div>

        <ShareCard share={currentShare} />

        <div className="flex justify-center gap-4 mt-6">
          <Button type="primary" onClick={() => navigate('/login')}>
            登录体验更多
          </Button>
          {currentShare.blindBoxId && (
            <Button
              className="!border-retro-gold-dark !text-retro-gold !bg-transparent"
              onClick={() => navigate('/login')}
            >
              查看盲盒
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
