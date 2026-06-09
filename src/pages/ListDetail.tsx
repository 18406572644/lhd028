import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Spin, Empty, Avatar, Modal, Tag, message, Tooltip } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  LockOutlined,
  LinkOutlined,
  GlobalOutlined,
  CloseOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import useMovieListStore from '@/store/movieListStore';
import useAuthStore from '@/store/authStore';
import dayjs from 'dayjs';

export default function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const {
    currentList,
    comments,
    loading,
    fetchListDetail,
    fetchComments,
    collectList,
    uncollectList,
    addComment,
    deleteComment,
    deleteList,
    removeMovieFromList,
  } = useMovieListStore();
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (id) {
      fetchListDetail(Number(id));
      fetchComments(Number(id));
    }
  }, [id]);

  const handleCollect = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (currentList?.isCollected) {
      await uncollectList(currentList.id);
    } else {
      await collectList(currentList!.id);
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;
    await addComment(Number(id), commentText.trim());
    setCommentText('');
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个片单吗？此操作不可恢复。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        const success = await deleteList(Number(id));
        if (success) {
          message.success('片单已删除');
          navigate('/lists');
        }
      },
    });
  };

  const handleRemoveMovie = async (movieId: number) => {
    await removeMovieFromList(Number(id), movieId);
    message.success('已从片单中移除');
  };

  const visibilityIcon = (v: string) => {
    if (v === 'PRIVATE') return <LockOutlined />;
    if (v === 'LINK') return <LinkOutlined />;
    return <GlobalOutlined />;
  };

  const visibilityLabel = (v: string) => {
    if (v === 'PRIVATE') return '私密';
    if (v === 'LINK') return '仅链接可见';
    return '公开';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentList) {
    return (
      <Empty
        description={<span className="text-retro-cream-dark">片单不存在或无权查看</span>}
        className="py-20"
      >
        <Button onClick={() => navigate('/lists')}>返回片单广场</Button>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="retro-card rounded-lg overflow-hidden">
        <div className="relative h-48 md:h-64 overflow-hidden">
          {currentList.cover ? (
            <img
              src={currentList.cover}
              alt={currentList.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-retro-brown-light flex items-center justify-center">
              <span className="text-6xl">🎞️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-retro-brown-dark via-retro-brown-dark/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <Tooltip title={visibilityLabel(currentList.visibility)}>
                <Tag icon={visibilityIcon(currentList.visibility)} color="default" className="bg-retro-brown/80 border-retro-gold-dark text-retro-gold">
                  {visibilityLabel(currentList.visibility)}
                </Tag>
              </Tooltip>
              <span className="text-retro-cream-dark text-xs">
                {currentList.movieCount} 部电影
              </span>
            </div>
            <h1 className="font-serif text-retro-cream text-2xl md:text-3xl">{currentList.title}</h1>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {currentList.description && (
            <p className="text-retro-cream-dark mb-4 leading-relaxed">{currentList.description}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {currentList.user?.avatar ? (
                <Avatar src={currentList.user.avatar} size={36} className="border border-retro-gold-dark" />
              ) : (
                <Avatar size={36} className="bg-retro-gold-dark/30 border border-retro-gold-dark">影</Avatar>
              )}
              <div>
                <span className="text-retro-cream text-sm font-medium">
                  {currentList.user?.nickname || currentList.user?.username || '影迷'}
                </span>
                <div className="text-retro-gold-dark text-xs">
                  {dayjs(currentList.createdAt).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                icon={currentList.isCollected ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleCollect}
                className={currentList.isCollected ? 'text-retro-crimson border-retro-crimson' : ''}
              >
                {currentList.isCollected ? '已收藏' : '收藏'} ({currentList.collectionCount})
              </Button>
              {currentList.isOwner && (
                <>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/lists/${id}/edit`)}
                  >
                    编辑
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={handleDelete}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-retro-cream text-lg mb-4 flex items-center gap-2">
          🎬 片单内容
          <span className="text-retro-gold-dark text-sm font-sans">({currentList.items?.length || 0})</span>
        </h2>
        {(!currentList.items || currentList.items.length === 0) ? (
          <Empty description={<span className="text-retro-cream-dark">片单中暂无电影</span>} />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {currentList.items.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className="retro-card rounded-lg p-3 flex items-center gap-3 group"
                >
                  <div className="flex items-center gap-2 text-retro-gold-dark text-sm">
                    {currentList.isOwner && <MenuOutlined className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />}
                    <span className="w-6 text-center font-mono">{index + 1}</span>
                  </div>

                  <div className="w-10 h-14 rounded overflow-hidden bg-retro-brown-dark shrink-0 cursor-pointer"
                    onClick={() => navigate(`/movies/${item.movieId}`)}>
                    {item.movie?.posterUrl ? (
                      <img src={item.movie.posterUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/movies/${item.movieId}`)}>
                    <h3 className="text-retro-cream text-sm font-medium truncate">
                      {item.movie?.title || `电影 #${item.movieId}`}
                    </h3>
                    <div className="flex items-center gap-2 text-retro-gold-dark text-xs mt-0.5">
                      {item.movie?.year && <span>{item.movie.year}</span>}
                      {item.movie?.genre && <span>{item.movie.genre}</span>}
                      {item.movie?.rating && (
                        <span className="text-retro-crimson">★ {item.movie.rating}</span>
                      )}
                    </div>
                  </div>

                  {item.tag && (
                    <Tag className="bg-retro-crimson/20 border-retro-crimson/50 text-retro-crimson text-xs shrink-0">
                      {item.tag}
                    </Tag>
                  )}

                  {currentList.isOwner && (
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      size="small"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-retro-gold-dark hover:text-retro-crimson shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleRemoveMovie(item.movieId); }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif text-retro-cream text-lg mb-4 flex items-center gap-2">
          💬 评论区
          <span className="text-retro-gold-dark text-sm font-sans">({currentList.commentCount})</span>
        </h2>

        {isLoggedIn && (
          <div className="flex gap-2 mb-4">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="说点什么..."
              onPressEnter={handleAddComment}
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              发送
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-retro-cream-dark text-sm text-center py-6">暂无评论，快来抢沙发~</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="retro-card rounded-lg p-3">
                <div className="flex items-start gap-3">
                  {comment.user?.avatar ? (
                    <Avatar src={comment.user.avatar} size={32} className="border border-retro-gold-dark shrink-0" />
                  ) : (
                    <Avatar size={32} className="bg-retro-gold-dark/30 border border-retro-gold-dark shrink-0">
                      {(comment.user?.nickname || '?')[0]}
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-retro-gold text-sm font-medium">
                        {comment.user?.nickname || comment.user?.username || '影迷'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-retro-gold-dark text-xs">
                          {dayjs(comment.createdAt).format('MM-DD HH:mm')}
                        </span>
                        {user && comment.userId === user.id && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            className="text-retro-gold-dark hover:text-retro-crimson"
                            onClick={() => deleteComment(comment.id)}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-retro-cream-dark text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
