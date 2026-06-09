import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty, Spin } from 'antd';
import { motion } from 'framer-motion';
import useBlindboxStore from '@/store/blindboxStore';
import BlindBoxCard from '@/components/BlindBoxCard';

export default function Collection() {
  const navigate = useNavigate();
  const { collections, loading, fetchCollections } = useBlindboxStore();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-retro-cream text-2xl">我的收藏</h1>

      {collections.length === 0 ? (
        <div className="retro-card rounded-xl p-12 text-center">
          <Empty description={<span className="text-retro-cream-dark">还没有收藏的盲盒</span>} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {collections.map((box, i) => (
            <motion.div
              key={box.blindboxId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <BlindBoxCard
                blindbox={box}
                onClick={() => navigate(`/collection/${box.blindboxId}`)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
