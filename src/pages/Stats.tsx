import { useEffect } from 'react';
import { Spin } from 'antd';
import { EyeOutlined, HeartOutlined, PlayCircleOutlined, GiftOutlined, StarOutlined, MessageOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import useStatsStore from '@/store/statsStore';

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="retro-card rounded-xl p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-retro-gold-dark text-xs">{label}</p>
        <p className="text-retro-cream text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const { overview, genreStats, monthlyStats, ratingStats, loading, fetchStats } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  }

  const pieOption = {
    backgroundColor: 'transparent',
    title: { text: '类型分布', left: 'center', textStyle: { color: '#D4A574', fontSize: 14 } },
    tooltip: { trigger: 'item', backgroundColor: '#2C1810', borderColor: '#B8864A', textStyle: { color: '#FFF8F0' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: genreStats.map((g) => ({ name: g.name, value: g.value })),
      label: { color: '#D4A574', fontSize: 11 },
      itemStyle: {
        borderColor: '#2C1810',
        borderWidth: 2,
      },
      color: ['#C41E3A', '#D4A574', '#B8602A', '#E8C9A0', '#8B4513', '#CD853F', '#DEB887', '#A0522D', '#D2691E', '#F4A460'],
    }],
  };

  const lineOption = {
    backgroundColor: 'transparent',
    title: { text: '月度观影趋势', left: 'center', textStyle: { color: '#D4A574', fontSize: 14 } },
    tooltip: { trigger: 'axis', backgroundColor: '#2C1810', borderColor: '#B8864A', textStyle: { color: '#FFF8F0' } },
    xAxis: {
      type: 'category',
      data: monthlyStats.map((m) => m.month),
      axisLine: { lineStyle: { color: '#B8864A' } },
      axisLabel: { color: '#B8864A', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#B8864A' } },
      axisLabel: { color: '#B8864A' },
      splitLine: { lineStyle: { color: '#3D2517' } },
    },
    series: [{
      type: 'line',
      data: monthlyStats.map((m) => m.count),
      smooth: true,
      lineStyle: { color: '#C41E3A', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(196,30,58,0.3)' }, { offset: 1, color: 'rgba(196,30,58,0.05)' }] } },
      itemStyle: { color: '#C41E3A' },
    }],
  };

  const barOption = {
    backgroundColor: 'transparent',
    title: { text: '评分分布', left: 'center', textStyle: { color: '#D4A574', fontSize: 14 } },
    tooltip: { trigger: 'axis', backgroundColor: '#2C1810', borderColor: '#B8864A', textStyle: { color: '#FFF8F0' } },
    xAxis: {
      type: 'category',
      data: ratingStats.map((r) => r.range),
      axisLine: { lineStyle: { color: '#B8864A' } },
      axisLabel: { color: '#B8864A', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#B8864A' } },
      axisLabel: { color: '#B8864A' },
      splitLine: { lineStyle: { color: '#3D2517' } },
    },
    series: [{
      type: 'bar',
      data: ratingStats.map((r) => r.count),
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#D4A574' }, { offset: 1, color: '#B8602A' }] },
        borderRadius: [4, 4, 0, 0],
      },
    }],
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-retro-cream text-2xl">数据统计</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<EyeOutlined />} label="已看" value={overview.totalWatched} color="bg-retro-gold/20 text-retro-gold" />
        <StatCard icon={<HeartOutlined />} label="想看" value={overview.totalWant} color="bg-retro-crimson/20 text-retro-crimson" />
        <StatCard icon={<PlayCircleOutlined />} label="在看" value={overview.totalWatching} color="bg-retro-orange/20 text-retro-orange" />
        <StatCard icon={<GiftOutlined />} label="盲盒" value={overview.totalBlindboxes} color="bg-retro-gold-light/20 text-retro-gold-light" />
        <StatCard icon={<StarOutlined />} label="均分" value={overview.avgRating?.toFixed(1)} color="bg-retro-gold/20 text-retro-gold" />
        <StatCard icon={<MessageOutlined />} label="影评" value={overview.totalReviews} color="bg-retro-cream-dark/20 text-retro-cream-dark" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="retro-card rounded-xl p-4">
          <ReactECharts option={pieOption} style={{ height: 320 }} />
        </div>
        <div className="retro-card rounded-xl p-4">
          <ReactECharts option={lineOption} style={{ height: 320 }} />
        </div>
      </div>

      <div className="retro-card rounded-xl p-4">
        <ReactECharts option={barOption} style={{ height: 320 }} />
      </div>
    </div>
  );
}
