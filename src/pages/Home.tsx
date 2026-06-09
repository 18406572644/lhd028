import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiftOutlined, PlayCircleOutlined, FireOutlined } from '@ant-design/icons';
import { Button, Carousel } from 'antd';
import useMovieStore from '@/store/movieStore';
import MovieCard from '@/components/MovieCard';

export default function Home() {
  const navigate = useNavigate();
  const { movies, fetchMovies, loading } = useMovieStore();

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const hotMovies = Array.isArray(movies) ? movies.slice(0, 8) : [];

  return (
    <div className="space-y-8">
      <section className="relative rounded-xl overflow-hidden min-h-[400px] bg-retro-brown flex items-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-retro-crimson/30 rounded-full blur-3xl animate-spotlight" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-retro-gold/20 rounded-full blur-3xl animate-spotlight" style={{ animationDelay: '2s' }} />
        </div>

        <div className="absolute left-0 top-0 bottom-0 film-perforations opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 film-perforations opacity-30" />

        <div className="relative z-10 px-8 lg:px-16 py-12 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-retro-gold-dark text-sm tracking-[0.5em] mb-3 uppercase">Cinema Blind Box</p>
            <h1 className="font-display text-4xl lg:text-5xl text-retro-cream mb-4 leading-tight">
              每一次开启<br/>
              <span className="text-retro-gold">都是一场奇遇</span>
            </h1>
            <p className="text-retro-cream-dark mb-8 text-lg">
              让命运为你选择下一部电影，开启属于你的电影盲盒之旅
            </p>
            <div className="flex gap-4">
              <Button
                type="primary"
                size="large"
                icon={<GiftOutlined />}
                onClick={() => navigate('/blindbox')}
                className="!bg-retro-crimson !border-retro-crimson hover:!bg-retro-crimson-light h-12 px-8 text-base"
              >
                开启盲盒
              </Button>
              <Button
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={() => navigate('/movies')}
                className="!border-retro-gold-dark !text-retro-gold hover:!border-retro-gold h-12 px-8 text-base !bg-transparent"
              >
                浏览电影库
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 text-[120px] opacity-10 select-none">
          🎬
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <FireOutlined className="text-retro-crimson text-xl" />
          <h2 className="font-serif text-retro-cream text-2xl">热门推荐</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-retro-gold-dark/50 to-transparent" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-retro-brown-light rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {hotMovies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  poster={movie.poster}
                  rating={movie.rating}
                  releaseDate={movie.releaseDate}
                  genre={movie.genre}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="retro-card rounded-xl p-8 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-display text-retro-gold text-3xl mb-3">不知道看什么？</h2>
          <p className="text-retro-cream-dark mb-6 max-w-md mx-auto">
            让盲盒为你挑选一部意想不到的好电影，也许你会发现新的最爱
          </p>
          <Button
            type="primary"
            size="large"
            icon={<GiftOutlined />}
            onClick={() => navigate('/blindbox')}
            className="!bg-retro-crimson !border-retro-crimson h-12 px-8"
          >
            立即开盲盒
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
