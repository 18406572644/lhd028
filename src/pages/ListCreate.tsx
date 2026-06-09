import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, Button, message } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { AnimatePresence, Reorder } from 'framer-motion';
import useMovieListStore from '@/store/movieListStore';
import useMovieStore from '@/store/movieStore';

const visibilityOptions = [
  { value: 'PUBLIC', label: '🌍 公开' },
  { value: 'LINK', label: '🔗 仅链接可见' },
  { value: 'PRIVATE', label: '🔒 私密' },
];

const tagPresets = ['封神之作', '哭到失声', '笑到停不下来', '细思极恐', '治愈神片', '视觉盛宴', '演技炸裂', '反转惊喜', '意难平', '看完沉默', '经典必看', '冷门佳作'];

interface ListItemData {
  movieId: number;
  title: string;
  posterUrl: string;
  rating: number;
  tag: string;
}

export default function ListCreate() {
  const navigate = useNavigate();
  const { createList } = useMovieListStore();
  const { movies, fetchMovies, setFilters } = useMovieStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [items, setItems] = useState<ListItemData[]>([]);
  const [cover, setCover] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setSearchKeyword(value);
    if (value.trim()) {
      setFilters({ keyword: value.trim() });
      fetchMovies();
    }
  }, [setFilters, fetchMovies]);

  const addMovie = (movie: any) => {
    if (items.some((i) => i.movieId === movie.id)) {
      message.warning('该电影已在片单中');
      return;
    }
    const newItem: ListItemData = {
      movieId: movie.id,
      title: movie.title,
      posterUrl: movie.poster || movie.posterUrl || '',
      rating: movie.rating,
      tag: '',
    };
    setItems((prev) => [...prev, newItem]);
    if (!cover && newItem.posterUrl) {
      setCover(newItem.posterUrl);
    }
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTag = (index: number, tag: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, tag } : item)));
  };

  const reorderItems = (newItems: ListItemData[]) => {
    setItems(newItems);
  };

  const setCoverFromItem = (posterUrl: string) => {
    setCover(posterUrl);
    message.success('已设置封面');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.warning('请输入片单标题');
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        cover,
        visibility,
        items: items.map((item, index) => ({
          movieId: item.movieId,
          sortOrder: index,
          tag: item.tag || undefined,
        })),
      };
      const result = await createList(data);
      if (result) {
        message.success('片单创建成功');
        navigate(`/lists/${result.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const safeMovies = Array.isArray(movies) ? movies : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-retro-cream text-2xl">创建片单</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/lists')}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>
            创建
          </Button>
        </div>
      </div>

      <div className="retro-card rounded-lg p-4 md:p-6 space-y-4">
        <div>
          <label className="text-retro-gold text-sm mb-1 block">片单标题 *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={'给你的片单起个名字，如"年度十佳科幻"'}
            maxLength={100}
            showCount
          />
        </div>

        <div>
          <label className="text-retro-gold text-sm mb-1 block">片单描述</label>
          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简单介绍一下这个片单..."
            maxLength={500}
            showCount
            rows={3}
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="w-40">
            <label className="text-retro-gold text-sm mb-1 block">可见性</label>
            <Select
              value={visibility}
              onChange={setVisibility}
              options={visibilityOptions}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-retro-gold text-sm mb-1 block">封面</label>
            <div className="flex items-center gap-2">
              {cover ? (
                <div className="relative w-16 h-20 rounded overflow-hidden border border-retro-gold-dark">
                  <img src={cover} alt="" className="w-full h-full object-cover" />
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    size="small"
                    className="absolute top-0 right-0 text-retro-cream bg-retro-brown/80"
                    onClick={() => setCover('')}
                  />
                </div>
              ) : (
                <div className="w-16 h-20 rounded border border-dashed border-retro-gold-dark flex items-center justify-center text-retro-gold-dark text-xs">
                  无封面
                </div>
              )}
              <span className="text-retro-gold-dark text-xs">从片单电影中选择封面</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-retro-cream text-lg mb-3">搜索添加电影</h2>
        <Input.Search
          placeholder="搜索电影名称..."
          allowClear
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
          className="mb-3"
        />
        {searchKeyword && safeMovies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 max-h-60 overflow-y-auto p-1">
            {safeMovies.slice(0, 8).map((movie) => (
              <div
                key={movie.id}
                className="retro-card rounded p-2 flex items-center gap-2 cursor-pointer hover:border-retro-gold"
                onClick={() => addMovie(movie)}
              >
                <div className="w-8 h-10 rounded overflow-hidden bg-retro-brown-dark shrink-0">
                  {movie.poster || (movie as any).posterUrl ? (
                    <img src={movie.poster || (movie as any).posterUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-retro-cream text-xs truncate">{movie.title}</div>
                  <div className="text-retro-gold-dark text-[10px]">★ {movie.rating}</div>
                </div>
                <PlusOutlined className="text-retro-gold shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-retro-cream text-lg flex items-center gap-2">
            🎬 片单内容
            <span className="text-retro-gold-dark text-sm font-sans">({items.length})</span>
          </h2>
          {items.length > 0 && (
            <span className="text-retro-gold-dark text-xs">拖拽排序</span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="retro-card rounded-lg p-8 text-center">
            <p className="text-retro-cream-dark">搜索并添加电影到你的片单</p>
          </div>
        ) : (
          <Reorder.Group axis="y" values={items} onReorder={reorderItems} className="space-y-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <Reorder.Item
                  key={`${item.movieId}-${index}`}
                  value={item}
                  className="retro-card rounded-lg p-3 flex items-center gap-3 list-none"
                >
                  <MenuOutlined className="text-retro-gold-dark cursor-grab shrink-0" />
                  <span className="text-retro-gold-dark text-sm w-6 text-center font-mono shrink-0">{index + 1}</span>

                  <div className="w-10 h-14 rounded overflow-hidden bg-retro-brown-dark shrink-0 cursor-pointer"
                    onClick={() => item.posterUrl && setCoverFromItem(item.posterUrl)}
                    title="点击设为封面">
                    {item.posterUrl ? (
                      <img src={item.posterUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-retro-cream text-sm font-medium truncate">{item.title}</h3>
                    <div className="text-retro-gold-dark text-xs mt-0.5">
                      ★ {item.rating}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={item.tag || undefined}
                      onChange={(v) => updateTag(index, v)}
                      placeholder="标签"
                      allowClear
                      className="w-28"
                      options={tagPresets.map((t) => ({ value: t, label: t }))}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      size="small"
                      className="text-retro-gold-dark hover:text-retro-crimson"
                      onClick={() => removeItem(index)}
                    />
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-retro-gold-dark/30">
        <Button onClick={() => navigate('/lists')}>取消</Button>
        <Button type="primary" onClick={handleSubmit} loading={submitting} disabled={!title.trim()}>
          创建片单
        </Button>
      </div>
    </div>
  );
}
