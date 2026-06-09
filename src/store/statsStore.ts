import { create } from 'zustand';
import request from '@/utils/request';

interface StatsOverview {
  totalWatched: number;
  totalWant: number;
  totalWatching: number;
  totalBlindboxes: number;
  avgRating: number;
  totalReviews: number;
}

interface GenreStat {
  name: string;
  value: number;
}

interface MonthlyStat {
  month: string;
  count: number;
}

interface RatingStat {
  range: string;
  count: number;
}

interface StatsState {
  overview: StatsOverview;
  genreStats: GenreStat[];
  monthlyStats: MonthlyStat[];
  ratingStats: RatingStat[];
  loading: boolean;
  fetchStats: () => Promise<void>;
}

const useStatsStore = create<StatsState>((set) => ({
  overview: {
    totalWatched: 0,
    totalWant: 0,
    totalWatching: 0,
    totalBlindboxes: 0,
    avgRating: 0,
    totalReviews: 0,
  },
  genreStats: [],
  monthlyStats: [],
  ratingStats: [],
  loading: false,

  fetchStats: async () => {
    set({ loading: true });
    try {
      const [overviewRes, genreRes, monthlyRes, ratingRes] = await Promise.all([
        request.get('/stats/overview'),
        request.get('/stats/genre-distribution'),
        request.get('/stats/monthly-watching'),
        request.get('/stats/rating-distribution'),
      ]);
      const overviewData: any = overviewRes;
      const genreData: any = genreRes;
      const monthlyData: any = monthlyRes;
      const ratingData: any = ratingRes;
      set({
        overview: overviewData.data || {
          totalWatched: 0, totalWant: 0, totalWatching: 0,
          totalBlindboxes: 0, avgRating: 0, totalReviews: 0,
        },
        genreStats: genreData.data || [],
        monthlyStats: monthlyData.data || [],
        ratingStats: ratingData.data || [],
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));

export default useStatsStore;
