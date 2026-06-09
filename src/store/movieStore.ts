import { create } from 'zustand';
import request from '@/utils/request';

export interface Movie {
  id: number;
  title: string;
  poster: string;
  director: string;
  actors: string;
  genre: string;
  releaseDate: string;
  rating: number;
  description: string;
  duration: number;
  country: string;
}

interface MovieFilters {
  keyword: string;
  genre: string;
}

interface MovieState {
  movies: Movie[];
  currentMovie: Movie | null;
  filters: MovieFilters;
  loading: boolean;
  fetchMovies: () => Promise<void>;
  fetchMovieById: (id: number) => Promise<void>;
  setFilters: (filters: Partial<MovieFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: MovieFilters = {
  keyword: '',
  genre: '',
};

const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  currentMovie: null,
  filters: { ...defaultFilters },
  loading: false,

  fetchMovies: async () => {
    set({ loading: true });
    try {
      const { filters } = get();
      const params: any = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.genre) params.genre = filters.genre;
      const data: any = await request.get('/movies', { params });
      const rawData = data.data;
      const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.list) ? rawData.list : [];
      set({ movies: list, loading: false });
    } catch {
      set((state) => ({ movies: Array.isArray(state.movies) ? state.movies : [], loading: false }));
    }
  },

  fetchMovieById: async (id) => {
    set({ loading: true });
    try {
      const data: any = await request.get(`/movies/${id}`);
      set({ currentMovie: data.data || null, loading: false });
    } catch {
      set({ currentMovie: null, loading: false });
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },
}));

export default useMovieStore;
