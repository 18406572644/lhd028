import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Slider, Spin, message } from 'antd';
import { GiftOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import useBlindboxStore from '@/store/blindboxStore';
import MovieCard from '@/components/MovieCard';

const genreOptions = [
  '剧情', '喜剧', '动作', '爱情', '科幻', '悬疑',
  '恐怖', '动画', '纪录片', '战争', '犯罪', '奇幻',
];

export default function BlindBox() {
  const navigate = useNavigate();
  const { currentBox, preferences, generating, generateBlindBox, collectBlindBox, setPreferences } = useBlindboxStore();
  const [opening, setOpening] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const toggleGenre = (genre: string) => {
    const genres = preferences.genres.includes(genre)
      ? preferences.genres.filter((g) => g !== genre)
      : [...preferences.genres, genre];
    setPreferences({ genres });
  };

  const handleGenerate = async () => {
    setOpening(true);
    setShowResult(false);
    try {
      await generateBlindBox();
      setTimeout(() => {
        setOpening(false);
        setShowResult(true);
      }, 1500);
    } catch {
      setOpening(false);
    }
  };

  const handleCollect = async () => {
    if (!currentBox) return;
    await collectBlindBox(currentBox.blindboxId);
    message.success('已收藏到我的盲盒');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-retro-cream text-3xl mb-2">电影盲盒</h1>
        <p className="text-retro-gold-dark">选择你的偏好，让命运挑选一部好电影</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="retro-card rounded-xl p-6">
          <h3 className="text-retro-gold text-sm mb-4 font-medium">偏好类型</h3>
          <div className="flex flex-wrap gap-2">
            {genreOptions.map((g) => (
              <Tag
                key={g}
                onClick={() => toggleGenre(g)}
                className={`cursor-pointer transition-all !text-sm !px-4 !py-1 !rounded-full !border-retro-gold-dark
                  ${preferences.genres.includes(g)
                    ? '!bg-retro-crimson/30 !border-retro-crimson !text-retro-gold'
                    : '!bg-transparent !text-retro-cream-dark hover:!border-retro-gold'
                  }`}
              >
                {g}
              </Tag>
            ))}
          </div>
        </div>

        <div className="retro-card rounded-xl p-6">
          <h3 className="text-retro-gold text-sm mb-4 font-medium">年代范围</h3>
          <Slider
            range
            min={1970}
            max={2025}
            value={preferences.yearRange}
            onChange={(v) => setPreferences({ yearRange: v as [number, number] })}
            marks={{ 1970: '70s', 1990: '90s', 2000: '00s', 2010: '10s', 2025: '25' }}
          />
        </div>

        <div className="retro-card rounded-xl p-6">
          <h3 className="text-retro-gold text-sm mb-4 font-medium">最低评分</h3>
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={preferences.minRating}
            onChange={(v) => setPreferences({ minRating: v })}
            marks={{ 0: '不限', 5: '5分', 7: '7分', 8: '8分', 10: '10分' }}
          />
        </div>

        <div className="text-center py-4">
          <Button
            type="primary"
            size="large"
            icon={generating || opening ? <Spin size="small" /> : <GiftOutlined />}
            onClick={handleGenerate}
            loading={generating || opening}
            className="!h-14 !px-12 !text-lg !rounded-xl"
          >
            {opening ? '开启中...' : generating ? '生成中...' : '开盲盒'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showResult && currentBox && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="max-w-lg mx-auto"
          >
            <div className="retro-card rounded-xl p-6 text-center border-2 border-retro-gold">
              <p className="text-retro-gold-dark text-sm tracking-widest mb-4">你的盲盒电影</p>

              <div className="grid grid-cols-1 gap-4 mb-4">
                {currentBox.movies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                    <div className="w-40 mx-auto">
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        poster={movie.poster}
                        rating={movie.rating}
                        releaseDate={movie.releaseDate}
                        genre={movie.genre}
                      />
                    </div>
                    <h2 className="font-serif text-retro-cream text-lg mt-2">{movie.title}</h2>
                    <p className="text-retro-gold-dark text-sm">
                      ★ {movie.rating} · {movie.releaseDate?.split('-')[0]} · {movie.genre}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button type="primary" onClick={handleCollect} disabled={currentBox.collected}>
                  {currentBox.collected ? '已收藏' : '收藏'}
                </Button>
                {currentBox.movies[0] && (
                  <Button onClick={() => navigate(`/movies/${currentBox.movies[0].id}`)}>
                    查看详情
                  </Button>
                )}
                <Button icon={<ReloadOutlined />} onClick={handleGenerate}>
                  再开一个
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
