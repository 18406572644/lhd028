import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Empty, Spin, Popconfirm, message } from 'antd';
import { ClockCircleOutlined, EyeOutlined, PlayCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useWatchHistoryStore from '@/store/watchHistoryStore';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  WANT: { label: '想看', color: '!bg-retro-crimson/20 !border-retro-crimson !text-retro-crimson', icon: <HeartOutlined /> },
  WATCHING: { label: '在看', color: '!bg-retro-orange/20 !border-retro-orange !text-retro-orange', icon: <PlayCircleOutlined /> },
  WATCHED: { label: '已看', color: '!bg-retro-gold/20 !border-retro-gold !text-retro-gold', icon: <EyeOutlined /> },
};

const filterOptions = [
  { value: '', label: '全部' },
  { value: 'WANT', label: '想看' },
  { value: 'WATCHING', label: '在看' },
  { value: 'WATCHED', label: '已看' },
];

export default function History() {
  const navigate = useNavigate();
  const { history, loading, filterStatus, fetchHistory, removeHistory, setFilterStatus } = useWatchHistoryStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, filterStatus]);

  const handleDelete = async (id: number) => {
    await removeHistory(id);
    message.success('已删除');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-retro-cream text-2xl">观影记录</h1>
        <div className="flex gap-2">
          {filterOptions.map((opt) => (
            <Tag
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`cursor-pointer !px-4 !py-1 !rounded-full transition-all
                ${filterStatus === opt.value
                  ? '!bg-retro-crimson/30 !border-retro-crimson !text-retro-gold'
                  : '!bg-transparent !border-retro-gold-dark/50 !text-retro-cream-dark hover:!border-retro-gold'
                }`}
            >
              {opt.label}
            </Tag>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spin size="large" /></div>
      ) : history.length === 0 ? (
        <div className="retro-card rounded-xl p-12 text-center">
          <Empty description={<span className="text-retro-cream-dark">暂无观影记录</span>} />
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-retro-gold-dark/30" />

          <div className="space-y-4">
            {history.map((item, i) => {
              const config = statusConfig[item.watchStatus] || statusConfig.WANT;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-14"
                >
                  <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-retro-brown-dark border-2 border-retro-gold-dark flex items-center justify-center">
                    <ClockCircleOutlined className="text-retro-gold-dark text-[10px]" />
                  </div>

                  <div className="retro-card rounded-lg p-4 flex gap-4">
                    <div
                      className="w-16 shrink-0 cursor-pointer"
                      onClick={() => navigate(`/movies/${item.movieId}`)}
                    >
                      {item.moviePoster ? (
                        <img src={item.moviePoster} alt="" className="w-full aspect-[2/3] object-cover rounded" />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-retro-brown-dark rounded flex items-center justify-center text-lg">🎬</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-retro-cream text-sm font-medium cursor-pointer hover:text-retro-gold transition-colors"
                          onClick={() => navigate(`/movies/${item.movieId}`)}
                        >
                          {item.movieTitle}
                        </h3>
                        <Tag className={`!text-xs !px-2 !py-0 !rounded ${config.color}`}>
                          {config.icon} {config.label}
                        </Tag>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-retro-gold-dark text-xs">{item.watchedAt || item.createdAt}</span>
                        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(item.id)} okText="删除" cancelText="取消">
                          <span className="text-retro-gold-dark/50 text-xs cursor-pointer hover:text-retro-crimson">删除</span>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
