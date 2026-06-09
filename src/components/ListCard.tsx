import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartOutlined, HeartFilled, MessageOutlined } from '@ant-design/icons';
import type { MovieListDetail } from '@/store/movieListStore';

interface ListCardProps {
  list: MovieListDetail;
  onCollect?: (id: number, collected: boolean) => void;
}

export default function ListCard({ list, onCollect }: ListCardProps) {
  const navigate = useNavigate();

  const handleCollect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCollect?.(list.id, list.isCollected);
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="retro-card rounded-lg overflow-hidden cursor-pointer group relative"
      onClick={() => navigate(`/lists/${list.id}`)}
    >
      <div className="relative h-40 overflow-hidden bg-retro-brown-dark">
        {list.cover ? (
          <img
            src={list.cover}
            alt={list.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-retro-brown-light">
            <span className="text-4xl">🎞️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-retro-brown-dark via-retro-brown-dark/30 to-transparent" />

        <div className="absolute top-2 right-2 flex gap-1">
          {list.visibility === 'PRIVATE' && (
            <span className="bg-retro-brown/80 text-retro-gold-dark px-2 py-0.5 rounded text-xs">
              私密
            </span>
          )}
          {list.visibility === 'LINK' && (
            <span className="bg-retro-brown/80 text-retro-gold-dark px-2 py-0.5 rounded text-xs">
              仅链接
            </span>
          )}
        </div>

        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 bg-retro-brown/80 rounded-full px-2 py-1 cursor-pointer hover:bg-retro-brown-light/80 transition-colors"
          onClick={handleCollect}
        >
          {list.isCollected ? (
            <HeartFilled className="text-retro-crimson text-sm" />
          ) : (
            <HeartOutlined className="text-retro-gold text-sm" />
          )}
          <span className="text-retro-cream-dark text-xs">{list.collectionCount}</span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-retro-cream text-sm font-medium truncate mb-1">{list.title}</h3>
        {list.description && (
          <p className="text-retro-cream-dark text-xs line-clamp-2 mb-2">{list.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {list.user?.avatar ? (
              <img src={list.user.avatar} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-retro-gold-dark/30 flex items-center justify-center">
                <span className="text-retro-gold-dark text-[10px]">👤</span>
              </div>
            )}
            <span className="text-retro-gold-dark text-xs">{list.user?.nickname || list.user?.username || '影迷'}</span>
          </div>
          <div className="flex items-center gap-2 text-retro-gold-dark text-xs">
            <span>{list.movieCount} 部</span>
            <span className="flex items-center gap-0.5">
              <MessageOutlined className="text-[10px]" /> {list.commentCount}
            </span>
          </div>
        </div>

        {list.items && list.items.length > 0 && (
          <div className="mt-2 flex -space-x-1 overflow-hidden">
            {list.items.slice(0, 4).map((item, i) => (
              <div
                key={item.id || i}
                className="w-6 h-8 rounded-sm overflow-hidden border border-retro-brown-dark shrink-0"
              >
                {item.movie?.posterUrl ? (
                  <img src={item.movie.posterUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-retro-brown-light" />
                )}
              </div>
            ))}
            {list.items.length > 4 && (
              <div className="w-6 h-8 rounded-sm bg-retro-brown-light/50 flex items-center justify-center border border-retro-brown-dark shrink-0">
                <span className="text-retro-gold-dark text-[8px]">+{list.items.length - 4}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
