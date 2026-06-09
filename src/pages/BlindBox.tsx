import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Slider, Spin, message } from 'antd';
import { GiftOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import type { Container, ISourceOptions } from '@tsparticles/engine';
import useBlindboxStore from '@/store/blindboxStore';
import type { Rarity } from '@/store/blindboxStore';

const genreOptions = [
  '剧情', '喜剧', '动作', '爱情', '科幻', '悬疑',
  '恐怖', '动画', '纪录片', '战争', '犯罪', '奇幻',
];

const rarityConfig: Record<Rarity, { label: string; color: string; bgColor: string; borderColor: string }> = {
  common: { label: '普通', color: '#B8864A', bgColor: 'rgba(184, 134, 74, 0.15)', borderColor: '#B8864A' },
  rare: { label: '稀有', color: '#6495ED', bgColor: 'rgba(100, 149, 237, 0.15)', borderColor: '#6495ED' },
  legendary: { label: '传说', color: '#FFD700', bgColor: 'rgba(255, 215, 0, 0.15)', borderColor: '#FFD700' },
};

const particleOptions: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  particles: {
    number: { value: 0 },
    color: { value: ['#FFD700', '#FFA500', '#D4A574', '#FFFFFF', '#FF6347'] },
    shape: { type: ['circle', 'star'] },
    opacity: { value: { min: 0.3, max: 1 }, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
    size: { value: { min: 2, max: 6 }, animation: { enable: true, speed: 3, minimumValue: 0.5 } },
    move: {
      enable: true,
      speed: { min: 8, max: 16 },
      direction: 'outside',
      outModes: { default: 'destroy' },
      straight: false,
    },
    life: { duration: { value: { min: 1, max: 2.5 } }, count: 1 },
  },
  detectRetina: true,
  emitters: {
    position: { x: 50, y: 50 },
    rate: { delay: 0.02, quantity: 5 },
    size: { width: 0, height: 0 },
    life: { duration: 0.3, count: 1 },
  },
};

function createClickSound(): AudioBuffer | null {
  try {
    const ctx = new AudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.15;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.6;
      data[i] += Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 20) * 0.4;
    }
    ctx.close();
    return buffer;
  } catch {
    return null;
  }
}

function createCheerSound(): AudioBuffer | null {
  try {
    const ctx = new AudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.5;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4) * (1 - Math.exp(-t * 100));
      data[i] = (Math.sin(2 * Math.PI * 523 * t) + Math.sin(2 * Math.PI * 659 * t) + Math.sin(2 * Math.PI * 784 * t)) / 3 * envelope * 0.4;
      data[i] += (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.15;
    }
    ctx.close();
    return buffer;
  } catch {
    return null;
  }
}

function playSound(buffer: AudioBuffer | null) {
  if (!buffer) return;
  try {
    const ctx = new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.onended = () => ctx.close();
  } catch {}
}

export default function BlindBox() {
  const navigate = useNavigate();
  const { currentBox, preferences, generating, generateBlindBox, collectBlindBox, setPreferences } = useBlindboxStore();
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'opening' | 'revealing' | 'done'>('idle');
  const [showParticles, setShowParticles] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const particlesRef = useRef<Container | null>(null);
  const clickBufferRef = useRef<AudioBuffer | null>(null);
  const cheerBufferRef = useRef<AudioBuffer | null>(null);
  const currentBoxRef = useRef(currentBox);

  useEffect(() => {
    currentBoxRef.current = currentBox;
  }, [currentBox]);

  useEffect(() => {
    clickBufferRef.current = createClickSound();
    cheerBufferRef.current = createCheerSound();
  }, []);

  const particlesLoaded = useCallback((container?: Container) => {
    particlesRef.current = container ?? null;
  }, []);

  const toggleGenre = (genre: string) => {
    const genres = preferences.genres.includes(genre)
      ? preferences.genres.filter((g) => g !== genre)
      : [...preferences.genres, genre];
    setPreferences({ genres });
  };

  const triggerExplosion = useCallback(() => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 2000);
  }, []);

  const handleGenerate = async () => {
    setPhase('shaking');
    setRevealIndex(-1);
    setShowParticles(false);

    try {
      await generateBlindBox();
      playSound(clickBufferRef.current);

      setTimeout(() => {
        setPhase('opening');
        triggerExplosion();

        setTimeout(() => {
          setPhase('revealing');
          setRevealIndex(0);

          const revealNext = (idx: number) => {
            setTimeout(() => {
              if (currentBoxRef.current && idx < currentBoxRef.current.movies.length) {
                setRevealIndex(idx);
                revealNext(idx + 1);
              } else {
                setPhase('done');
                playSound(cheerBufferRef.current);
              }
            }, 2000);
          };

          setTimeout(() => revealNext(1), 2000);
        }, 1200);
      }, 800);
    } catch {
      setPhase('idle');
    }
  };

  const handleCollect = async () => {
    if (!currentBox) return;
    await collectBlindBox(currentBox.blindboxId);
    message.success('已收藏到我的盲盒');
  };

  const isAnimating = phase !== 'idle' && phase !== 'done';

  return (
    <div className="space-y-8 relative">
      {showParticles && (
        <div className="particle-container">
          <Particles
            id="blindbox-particles"
            options={particleOptions}
            particlesLoaded={particlesLoaded}
          />
        </div>
      )}

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
            icon={isAnimating ? <Spin size="small" /> : <GiftOutlined />}
            onClick={handleGenerate}
            loading={isAnimating}
            className="!h-14 !px-12 !text-lg !rounded-xl"
          >
            {phase === 'shaking' ? '摇晃中...' : phase === 'opening' ? '开箱中...' : phase === 'revealing' ? '揭晓中...' : '开盲盒'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {(phase === 'shaking' || phase === 'opening') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="max-w-lg mx-auto flex justify-center py-8"
          >
            <div className="blindbox-scene">
              <div className={`blindbox-cube ${phase === 'shaking' ? 'shaking' : ''}`}>
                <div className="blindbox-face front">
                  <span className="text-5xl">🎁</span>
                </div>
                <div className="blindbox-face back">
                  <span className="text-4xl">?</span>
                </div>
                <div className="blindbox-face right">
                  <span className="text-3xl">🎬</span>
                </div>
                <div className="blindbox-face left">
                  <span className="text-3xl">🍿</span>
                </div>
                <div className="blindbox-face bottom" />
                <div className={`blindbox-lid ${phase === 'opening' ? 'opened' : ''}`}>
                  <span className="text-3xl">✨</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === 'revealing' || phase === 'done') && currentBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            <div className="text-center mb-6">
              <p className="text-retro-gold-dark text-sm tracking-widest mb-2">你的盲盒电影</p>
              <div className="flex gap-2 justify-center">
                {currentBox.rarities.map((rarity, i) => {
                  const cfg = rarityConfig[rarity];
                  return (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ color: cfg.color, backgroundColor: cfg.bgColor, border: `1px solid ${cfg.borderColor}` }}
                    >
                      {cfg.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentBox.movies.map((movie, index) => {
                const rarity = currentBox.rarities[index];
                const cfg = rarityConfig[rarity];
                const isRevealed = index <= revealIndex || phase === 'done';
                const isCurrentlyRevealing = index === revealIndex && phase === 'revealing';

                return (
                  <AnimatePresence key={movie.id}>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className={`retro-card rounded-xl p-5 border-2 relative overflow-hidden rarity-${rarity}`}
                        style={{ borderColor: cfg.borderColor }}
                      >
                        {rarity === 'legendary' && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 animate-legendaryGlow opacity-30" />
                            <div className="absolute -top-2 -left-2 text-yellow-400 text-xs animate-sparkle" style={{ animationDelay: '0s' }}>✦</div>
                            <div className="absolute top-4 right-8 text-yellow-300 text-sm animate-sparkle" style={{ animationDelay: '0.3s' }}>✧</div>
                            <div className="absolute bottom-6 left-12 text-yellow-500 text-xs animate-sparkle" style={{ animationDelay: '0.6s' }}>✦</div>
                            <div className="absolute bottom-2 right-4 text-yellow-400 text-sm animate-sparkle" style={{ animationDelay: '0.9s' }}>✧</div>
                          </div>
                        )}

                        <div className="flex items-center gap-5 relative z-10">
                          <div className="w-28 flex-shrink-0">
                            <div className={`aspect-[2/3] rounded-lg overflow-hidden ${isCurrentlyRevealing ? 'reveal-poster' : ''}`}>
                              {movie.poster ? (
                                <img
                                  src={movie.poster}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-retro-brown-light">
                                  <span className="text-3xl">🎬</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-bold"
                                style={{ color: cfg.color, backgroundColor: cfg.bgColor, border: `1px solid ${cfg.borderColor}` }}
                              >
                                {cfg.label}
                              </span>
                            </div>
                            <h2 className="font-serif text-retro-cream text-lg mb-1 truncate">{movie.title}</h2>
                            <p className="text-retro-gold-dark text-sm">
                              ★ {movie.rating} · {movie.releaseDate?.split('-')[0]} · {movie.genre}
                            </p>
                            {movie.director && (
                              <p className="text-retro-cream-dark text-xs mt-1">导演: {movie.director}</p>
                            )}
                            {movie.description && (
                              <p className="text-retro-cream-dark text-xs mt-1 line-clamp-2">{movie.description}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center pt-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
