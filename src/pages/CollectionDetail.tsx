import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Empty, Tag } from 'antd';
import { ArrowLeftOutlined, HeartOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useBlindboxStore from '@/store/blindboxStore';
import StarRating from '@/components/StarRating';

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { collections, myBlindboxes, fetchCollections, fetchMyBlindboxes, collectBlindBox } = useBlindboxStore();

  useEffect(() => {
    fetchCollections();
    fetchMyBlindboxes();
  }, []);

  const allBoxes = [...collections, ...myBlindboxes];
  const box = allBoxes.find((b) => b.blindboxId === Number(id));

  if (!box) {
    return (
      <div className="flex justify-center py-20">
        <Empty description={<span className="text-retro-cream-dark">盲盒不存在</span>} />
      </div>
    );
  }

  const firstMovie = box.movies?.[0];

  return (
    <div className="space-y-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="!text-retro-gold-dark hover:!text-retro-gold"
      >
        返回
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="retro-card rounded-xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="w-48 shrink-0">
            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 film-perforations opacity-40" />
              {firstMovie?.poster ? (
                <img src={firstMovie.poster} alt={firstMovie.title} className="w-full aspect-[2/3] object-cover rounded border border-retro-gold-dark/30" />
              ) : (
                <div className="w-full aspect-[2/3] bg-retro-brown-dark rounded flex items-center justify-center">
                  <span className="text-5xl">🎁</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="!bg-retro-crimson/20 !border-retro-crimson !text-retro-crimson">
                盲盒电影
              </Tag>
              {box.collected && (
                <Tag className="!bg-retro-gold/20 !border-retro-gold !text-retro-gold">
                  <HeartOutlined /> 已收藏
                </Tag>
              )}
            </div>

            <h1 className="font-serif text-retro-cream text-2xl mb-2">{firstMovie?.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-retro-gold text-xl font-bold">★ {firstMovie?.rating?.toFixed(1)}</span>
              <StarRating value={(firstMovie?.rating || 0) / 2} readOnly size={16} />
            </div>

            <div className="space-y-2 text-retro-cream-dark text-sm">
              <p><span className="text-retro-gold-dark">上映日期：</span>{firstMovie?.releaseDate}</p>
              <p><span className="text-retro-gold-dark">类型：</span>{firstMovie?.genre}</p>
              <p><span className="text-retro-gold-dark">导演：</span>{firstMovie?.director}</p>
              <p><span className="text-retro-gold-dark">主演：</span>{firstMovie?.actors}</p>
              <p><span className="text-retro-gold-dark">时长：</span>{firstMovie?.duration}分钟</p>
            </div>

            {firstMovie?.description && (
              <p className="text-retro-cream-dark text-sm leading-relaxed mt-4">{firstMovie.description}</p>
            )}

            <div className="flex gap-3 mt-6">
              {!box.collected && (
                <Button type="primary" icon={<HeartOutlined />} onClick={() => collectBlindBox(box.blindboxId)}>
                  收藏
                </Button>
              )}
              <Button onClick={() => navigate(`/movies/${firstMovie?.id}`)}>查看电影详情</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-retro-gold-dark/30 px-6 py-3 flex items-center justify-between">
          <span className="text-retro-gold-dark text-xs">获得时间: {box.createdAt}</span>
          <span className="text-retro-gold-dark text-xs">盲盒 #{box.blindboxId}</span>
        </div>
      </motion.div>
    </div>
  );
}
