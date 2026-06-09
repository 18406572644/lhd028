import { create } from 'zustand';
import request from '@/utils/request';

export interface WatchHistoryItem {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  watchStatus: string;
  watchedAt: string;
  createdAt: string;
}

interface WatchHistoryState {
  history: WatchHistoryItem[];
  loading: boolean;
  filterStatus: string;
  fetchHistory: () => Promise<void>;
  addHistory: (movieId: number, status: string) => Promise<void>;
  updateStatus: (id: number, status: string) => Promise<void>;
  removeHistory: (id: number) => Promise<void>;
  setFilterStatus: (status: string) => void;
}

const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  history: [],
  loading: false,
  filterStatus: '',

  fetchHistory: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/watch-history');
      set({ history: data.data || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addHistory: async (movieId, status) => {
    try {
      await request.post('/watch-history', { movieId, watchStatus: status.toUpperCase(), watchedAt: new Date().toISOString().split('T')[0] });
      get().fetchHistory();
    } catch {}
  },

  updateStatus: async (id, status) => {
    try {
      await request.put(`/watch-history/${id}`, { watchStatus: status.toUpperCase(), watchedAt: new Date().toISOString().split('T')[0] });
      get().fetchHistory();
    } catch {}
  },

  removeHistory: async (id) => {
    try {
      await request.delete(`/watch-history/${id}`);
      set((state) => ({ history: state.history.filter((h) => h.id !== id) }));
    } catch {}
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
  },
}));

export default useWatchHistoryStore;
