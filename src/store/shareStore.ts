import { create } from 'zustand';
import request from '@/utils/request';

export interface ShareItem {
  id: number;
  shareCode: string;
  shareUrl: string;
  blindBoxId: number;
  createdAt: string;
}

interface ShareState {
  myShares: ShareItem[];
  currentShare: ShareItem | null;
  loading: boolean;
  createShare: (blindBoxId: number) => Promise<string>;
  fetchShareByCode: (shareId: string) => Promise<void>;
  deleteShare: (id: number) => Promise<void>;
}

const useShareStore = create<ShareState>((set, get) => ({
  myShares: [],
  currentShare: null,
  loading: false,

  createShare: async (blindBoxId) => {
    try {
      const data: any = await request.post('/shares', { blindBoxId });
      const shareCode = data.data?.shareCode;
      return shareCode || '';
    } catch {
      return '';
    }
  },

  fetchShareByCode: async (shareId) => {
    set({ loading: true });
    try {
      const data: any = await request.get(`/shares/${shareId}`);
      set({ currentShare: data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  deleteShare: async (id) => {
    try {
      await request.delete(`/shares/${id}`);
      set((state) => ({ myShares: state.myShares.filter((s) => s.id !== id) }));
    } catch {}
  },
}));

export default useShareStore;
