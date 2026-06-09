import { motion } from 'framer-motion';
import type { BlindBox } from '@/store/blindboxStore';

interface BlindBoxCardProps {
  blindbox: BlindBox;
  onClick?: () => void;
}

export default function BlindBoxCard({ blindbox, onClick }: BlindBoxCardProps) {
  const { movies, collected, createdAt } = blindbox;
  const movie = movies?.[0];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="retro-card rounded-lg overflow-hidden cursor-pointer relative"
      onClick={onClick}
    >
      <div className="absolute -top-0 right-4 z-10">
        <div className="bg-retro-crimson text-retro-cream text-[10px] px-3 py-1 rounded-b font-bold shadow-lg">
          {collected ? '已收藏' : '未收藏'}
        </div>
      </div>

      <div className="relative aspect-[2/3] overflow-hidden bg-retro-brown-dark">
        {movie?.poster ? (
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-retro-brown-light">
            <span className="text-5xl">🎁</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-retro-brown-dark/90 via-retro-brown-dark/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-retro-cream font-serif text-lg mb-1">{movie?.title}</h3>
          <div className="flex items-center gap-2 text-retro-gold text-xs">
            <span>★ {movie?.rating?.toFixed(1)}</span>
            <span>{movie?.releaseDate?.split('-')[0]}</span>
            <span>{movie?.genre}</span>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-retro-gold-dark/30 flex items-center justify-between">
        <span className="text-retro-gold-dark text-xs">{createdAt}</span>
        {collected && <span className="text-retro-crimson text-xs">❤ 已收藏</span>}
      </div>
    </motion.div>
  );
}
