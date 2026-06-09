import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MovieCardProps {
  id: number;
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
  genre: string;
}

export default function MovieCard({ id, title, poster, rating, releaseDate, genre }: MovieCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="retro-card rounded-lg overflow-hidden cursor-pointer group relative"
      onClick={() => navigate(`/movies/${id}`)}
    >
      <div className="absolute left-0 top-0 bottom-0 film-perforations opacity-50 z-10" />

      <div className="relative aspect-[2/3] overflow-hidden bg-retro-brown-dark">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-retro-brown-light">
            <span className="text-4xl">🎬</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-retro-brown-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2 bg-retro-crimson/90 text-retro-cream px-2 py-0.5 rounded text-xs font-bold">
          ★ {rating.toFixed(1)}
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-retro-cream text-sm font-medium truncate mb-1">{title}</h3>
        <div className="flex items-center gap-2 text-retro-gold-dark text-xs">
          <span>{releaseDate?.split('-')[0]}</span>
          <span className="text-retro-gold-dark/50">|</span>
          <span className="truncate">{genre}</span>
        </div>
      </div>
    </motion.div>
  );
}
