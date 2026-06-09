import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Divider, Input, Empty, Spin, Modal } from 'antd';
import { HeartOutlined, PlayCircleOutlined, ShareAltOutlined, StarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useMovieStore from '@/store/movieStore';
import useReviewStore from '@/store/reviewStore';
import useWatchHistoryStore from '@/store/watchHistoryStore';
import useShareStore from '@/store/shareStore';
import StarRating from '@/components/StarRating';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMovie, loading, fetchMovieById } = useMovieStore();
  const { reviews, fetchReviews, addReview } = useReviewStore();
  const { addHistory } = useWatchHistoryStore();
  const { createShare } = useShareStore();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');

  useEffect(() => {
    if (id) {
      fetchMovieById(Number(id));
      fetchReviews(Number(id));
    }
  }, [id]);

  const handleAddToWatch = (status: string) => {
    if (!id) return;
    addHistory(Number(id), status);
  };

  const handleSubmitReview = () => {
    if (!id || !reviewRating) return;
    addReview(Number(id), reviewRating, reviewContent);
    setReviewRating(0);
    setReviewContent('');
  };

  const handleShare = async () => {
    if (!id) return;
    const code = await createShare(Number(id));
    if (code) {
      Modal.success({
        title: '分享成功',
        content: `分享链接: ${window.location.origin}/share/${code}`,
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  }

  if (!currentMovie) {
    return <Empty description={<span className="text-retro-cream-dark">电影不存在</span>} />;
  }

  const m = currentMovie;

  return (
    <div className="space-y-6">
      <div className="retro-card rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="w-48 shrink-0">
            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 film-perforations opacity-40" />
              {m.poster ? (
                <img src={m.poster} alt={m.title} className="w-full aspect-[2/3] object-cover rounded border border-retro-gold-dark/30" />
              ) : (
                <div className="w-full aspect-[2/3] bg-retro-brown-dark rounded flex items-center justify-center">
                  <span className="text-5xl">🎬</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="font-serif text-retro-cream text-3xl mb-2">{m.title}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-retro-brown-dark/60 px-3 py-1.5 rounded">
                <span className="text-retro-gold text-2xl font-bold">{m.rating?.toFixed(1)}</span>
                <StarRating value={m.rating / 2} readOnly size={14} />
              </div>
              <span className="text-retro-cream-dark text-sm">{m.releaseDate?.split('-')[0]} · {m.duration}分钟 · {m.country}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {m.genre?.split(/[,\/、]/).map((g) => (
                <Tag key={g} className="!border-retro-gold-dark !text-retro-gold !bg-retro-brown-dark/40">
                  {g.trim()}
                </Tag>
              ))}
            </div>

            {m.director && (
              <p className="text-retro-cream-dark text-sm mb-1">
                <span className="text-retro-gold-dark">导演：</span>{m.director}
              </p>
            )}
            {m.actors && (
              <p className="text-retro-cream-dark text-sm mb-4">
                <span className="text-retro-gold-dark">主演：</span>{m.actors}
              </p>
            )}

            {m.description && (
              <p className="text-retro-cream-dark text-sm leading-relaxed mb-6">{m.description}</p>
            )}

            <div className="flex gap-3 flex-wrap">
              <Button icon={<HeartOutlined />} onClick={() => handleAddToWatch('WANT')} className="!border-retro-crimson !text-retro-crimson !bg-transparent">
                想看
              </Button>
              <Button icon={<PlayCircleOutlined />} onClick={() => handleAddToWatch('WATCHING')} className="!border-retro-gold-dark !text-retro-gold !bg-transparent">
                在看
              </Button>
              <Button icon={<StarOutlined />} onClick={() => handleAddToWatch('WATCHED')} className="!border-retro-orange !text-retro-orange !bg-transparent">
                已看
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShare} className="!border-retro-gold-dark !text-retro-cream-dark !bg-transparent">
                分享
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="retro-card rounded-xl p-6">
        <h2 className="font-serif text-retro-cream text-xl mb-4">影评</h2>

        <div className="mb-6 p-4 bg-retro-brown-dark/40 rounded-lg">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-retro-gold-dark text-sm">评分</span>
            <StarRating value={reviewRating} onChange={setReviewRating} />
          </div>
          <Input.TextArea
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="写下你的影评..."
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <Button type="primary" onClick={handleSubmitReview} disabled={!reviewRating}>
              发布影评
            </Button>
          </div>
        </div>

        <Divider className="!border-retro-gold-dark/30" />

        {reviews.length === 0 ? (
          <Empty description={<span className="text-retro-cream-dark">暂无影评</span>} />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-retro-brown-dark/30 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-retro-cream text-sm font-medium">{review.username}</span>
                  <StarRating value={review.rating} readOnly size={14} />
                  <span className="text-retro-gold-dark text-xs ml-auto">{review.createdAt}</span>
                </div>
                <p className="text-retro-cream-dark text-sm">{review.content}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
