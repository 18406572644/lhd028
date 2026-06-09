import { create } from 'zustand';
import request from '@/utils/request';
import type { Movie } from './movieStore';

export interface BlindBox {
  blindboxId: number;
  movies: Movie[];
  createdAt: string;
  collected: boolean;
}

interface BlindBoxPreferences {
  genres: string[];
  yearRange: [number, number];
  minRating: number;
}

interface BlindBoxState {
  currentBox: BlindBox | null;
  myBlindboxes: BlindBox[];
  collections: BlindBox[];
  preferences: BlindBoxPreferences;
  generating: boolean;
  loading: boolean;
  generateBlindBox: () => Promise<void>;
  collectBlindBox: (id: number) => Promise<void>;
  fetchMyBlindboxes: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  setPreferences: (prefs: Partial<BlindBoxPreferences>) => void;
}

const useBlindboxStore = create<BlindBoxState>((set, get) => ({
  currentBox: null,
  myBlindboxes: [],
  collections: [],
  preferences: { genres: [], yearRange: [1990, 2025], minRating: 0 },
  generating: false,
  loading: false,

  generateBlindBox: async () => {
    set({ generating: true, currentBox: null });
    try {
      const { preferences } = get();
      const yearRangeStr = `${preferences.yearRange[0]}-${preferences.yearRange[1]}`;
      const data: any = await request.post('/blindbox/generate', {
        genres: preferences.genres,
        yearRange: yearRangeStr,
        minRating: preferences.minRating,
        movieCount: 5,
      });
      set({ currentBox: data.data, generating: false });
    } catch {
      set({ generating: false });
    }
  },

  collectBlindBox: async (id) => {
    try {
      await request.post(`/blindbox/${id}/collect`);
      set((state) => ({
        currentBox: state.currentBox ? { ...state.currentBox, collected: true } : null,
        collections: state.collections.map((b) => (b.blindboxId === id ? { ...b, collected: true } : b)),
      }));
    } catch {}
  },

  fetchMyBlindboxes: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/blindbox/my');
      const rawData = data.data;
      const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.list) ? rawData.list : [];
      set({ myBlindboxes: list, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCollections: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/blindbox/collections');
      const rawData = data.data;
      const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.list) ? rawData.list : [];
      set({ collections: list, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setPreferences: (prefs) => {
    set((state) => ({ preferences: { ...state.preferences, ...prefs } }));
  },
}));

export default useBlindboxStore;
