import { useEffect } from 'react';
import { Input, Empty, Spin } from 'antd';
import { motion } from 'framer-motion';
import useMovieStore from '@/store/movieStore';
import MovieCard from '@/components/MovieCard';

const genres = ['全部', '剧情', '喜剧', '动作', '爱情', '科幻', '悬疑', '恐怖', '动画', '纪录片', '战争', '犯罪'];

export default function Movies() {
  const { movies, filters, loading, fetchMovies, setFilters } = useMovieStore();

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters({ keyword: value });
  };

  const handleGenreChange = (genre: string) => {
    setFilters({ genre: genre === '全部' ? '' : genre });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-retro-cream text-2xl">电影库</h1>
        <div className="w-64">
          <Input.Search
            placeholder="搜索电影..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch('')}
          />
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="w-48 shrink-0 space-y-6 hidden md:block">
          <div>
            <h3 className="text-retro-gold text-sm mb-3 font-medium">类型筛选</h3>
            <div className="space-y-1">
              {genres.map((g) => (
                <div
                  key={g}
                  onClick={() => handleGenreChange(g)}
                  className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                    (g === '全部' && !filters.genre) || filters.genre === g
                      ? 'bg-retro-crimson/20 text-retro-gold border-l-2 border-retro-crimson'
                      : 'text-retro-cream-dark hover:bg-retro-brown-light'
                  }`}
                >
                  {g}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="md:hidden mb-4 flex flex-wrap gap-2">
            {genres.map((g) => (
              <span
                key={g}
                onClick={() => handleGenreChange(g)}
                className={`px-3 py-1 rounded-full text-xs cursor-pointer border transition-colors ${
                  (g === '全部' && !filters.genre) || filters.genre === g
                    ? 'border-retro-crimson bg-retro-crimson/20 text-retro-gold'
                    : 'border-retro-gold-dark/50 text-retro-cream-dark'
                }`}
              >
                {g}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : movies.length === 0 ? (
            <Empty description={<span className="text-retro-cream-dark">暂无电影</span>} />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((movie, i) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
