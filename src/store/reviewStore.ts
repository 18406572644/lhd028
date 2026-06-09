import { create } from 'zustand';
import request from '@/utils/request';

export interface Review {
  id: number;
  movieId: number;
  userId: number;
  username: string;
  userAvatar: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  fetchReviews: (movieId: number) => Promise<void>;
  addReview: (movieId: number, rating: number, content: string) => Promise<void>;
  deleteReview: (id: number) => Promise<void>;
}

const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  loading: false,

  fetchReviews: async (movieId) => {
    set({ loading: true });
    try {
      const data: any = await request.get('/reviews', { params: { movieId } });
      set({ reviews: data.data || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addReview: async (movieId, rating, content) => {
    try {
      await request.post('/reviews', { movieId, rating, content });
      get().fetchReviews(movieId);
    } catch {}
  },

  deleteReview: async (id) => {
    try {
      await request.delete(`/reviews/${id}`);
      set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }));
    } catch {}
  },
}));

export default useReviewStore;
