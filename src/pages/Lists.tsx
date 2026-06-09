import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Empty, Spin, Button, Select } from 'antd';
import { PlusOutlined, StarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useMovieListStore from '@/store/movieListStore';
import useAuthStore from '@/store/authStore';
import ListCard from '@/components/ListCard';

const sortOptions = [
  { value: 'latest', label: '最新' },
  { value: 'hot', label: '最热' },
  { value: 'comments', label: '评论最多' },
];

export default function Lists() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { lists, total, loading, fetchPublicLists, collectList, uncollectList } = useMovieListStore();
  const [sort, setSort] = useState('latest');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPublicLists(page, 12, sort, keyword || undefined);
  }, [page, sort]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
    fetchPublicLists(1, 12, sort, value || undefined);
  };

  const handleCollect = async (id: number, collected: boolean) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (collected) {
      await uncollectList(id);
    } else {
      await collectList(id);
    }
  };

  const handleYearReview = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const result = await useMovieListStore.getState().generateYearReview();
    if (result) {
      navigate(`/lists/${result.id}`);
    }
  };

  const safeLists = Array.isArray(lists) ? lists : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-serif text-retro-cream text-2xl">片单广场</h1>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <Input.Search
              placeholder="搜索片单..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
          </div>
          <Select
            value={sort}
            onChange={(v) => { setSort(v); setPage(1); }}
            options={sortOptions}
            className="w-28"
          />
          {isLoggedIn && (
            <>
              <Button
                icon={<StarOutlined />}
                onClick={handleYearReview}
                className="retro-btn"
              >
                年度回顾
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/lists/create')}
              >
                创建片单
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : safeLists.length === 0 ? (
        <Empty
          description={<span className="text-retro-cream-dark">暂无公开片单</span>}
          className="py-20"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {safeLists.map((list, i) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ListCard list={list} onCollect={handleCollect} />
              </motion.div>
            ))}
          </div>

          {total > 12 && (
            <div className="flex justify-center pt-4">
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="retro-btn"
                >
                  上一页
                </Button>
                <span className="text-retro-cream-dark text-sm self-center px-3">
                  {page} / {Math.ceil(total / 12)}
                </span>
                <Button
                  disabled={page >= Math.ceil(total / 12)}
                  onClick={() => setPage((p) => p + 1)}
                  className="retro-btn"
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
