import { create } from 'zustand';
import request from '@/utils/request';

export interface MovieListItem {
  id: number;
  listId: number;
  movieId: number;
  sortOrder: number;
  tag: string;
  movie?: {
    id: number;
    title: string;
    posterUrl: string;
    rating: number;
    genre: string;
    year: number;
    director: string;
  };
}

export interface MovieListDetail {
  id: number;
  userId: number;
  title: string;
  description: string;
  cover: string;
  visibility: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
  items: MovieListItem[];
  movieCount: number;
  commentCount: number;
  collectionCount: number;
  isCollected: boolean;
  isOwner: boolean;
}

export interface ListComment {
  id: number;
  listId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
}

interface MovieListState {
  lists: MovieListDetail[];
  currentList: MovieListDetail | null;
  comments: ListComment[];
  collectedLists: MovieListDetail[];
  myLists: MovieListDetail[];
  total: number;
  page: number;
  loading: boolean;
  fetchPublicLists: (page?: number, size?: number, sort?: string, keyword?: string) => Promise<void>;
  fetchListDetail: (id: number) => Promise<void>;
  fetchMyLists: () => Promise<void>;
  fetchCollectedLists: () => Promise<void>;
  createList: (data: { title: string; description?: string; cover?: string; visibility?: string; items?: { movieId: number; sortOrder?: number; tag?: string }[] }) => Promise<MovieListDetail | null>;
  updateList: (id: number, data: { title?: string; description?: string; cover?: string; visibility?: string; items?: { movieId: number; sortOrder?: number; tag?: string }[] }) => Promise<MovieListDetail | null>;
  deleteList: (id: number) => Promise<boolean>;
  collectList: (id: number) => Promise<boolean>;
  uncollectList: (id: number) => Promise<boolean>;
  addComment: (listId: number, content: string) => Promise<void>;
  fetchComments: (listId: number, page?: number, size?: number) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  addMovieToList: (listId: number, movieId: number, sortOrder?: number, tag?: string) => Promise<boolean>;
  removeMovieFromList: (listId: number, movieId: number) => Promise<boolean>;
  generateYearReview: () => Promise<MovieListDetail | null>;
}

const useMovieListStore = create<MovieListState>((set, get) => ({
  lists: [],
  currentList: null,
  comments: [],
  collectedLists: [],
  myLists: [],
  total: 0,
  page: 1,
  loading: false,

  fetchPublicLists: async (page = 1, size = 12, sort = 'latest', keyword) => {
    set({ loading: true });
    try {
      const params: any = { page, size, sort };
      if (keyword) params.keyword = keyword;
      const data: any = await request.get('/lists', { params });
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      set({
        lists: list,
        total: rawData?.total || 0,
        page: rawData?.page || page,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchListDetail: async (id) => {
    set({ loading: true });
    try {
      const data: any = await request.get(`/lists/${id}`);
      set({ currentList: data.data || null, loading: false });
    } catch {
      set({ currentList: null, loading: false });
    }
  },

  fetchMyLists: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/lists/my');
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      set({ myLists: list, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCollectedLists: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/lists/collected');
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      set({ collectedLists: list, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createList: async (data) => {
    try {
      const res: any = await request.post('/lists', data);
      const newList = res.data;
      set((state) => ({ myLists: [newList, ...state.myLists] }));
      return newList;
    } catch {
      return null;
    }
  },

  updateList: async (id, data) => {
    try {
      const res: any = await request.put(`/lists/${id}`, data);
      const updated = res.data;
      set({ currentList: updated });
      return updated;
    } catch {
      return null;
    }
  },

  deleteList: async (id) => {
    try {
      await request.delete(`/lists/${id}`);
      set((state) => ({
        myLists: state.myLists.filter((l) => l.id !== id),
        lists: state.lists.filter((l) => l.id !== id),
        currentList: state.currentList?.id === id ? null : state.currentList,
      }));
      return true;
    } catch {
      return false;
    }
  },

  collectList: async (id) => {
    try {
      await request.post(`/lists/${id}/collect`);
      set((state) => {
        const updateList = (lists: MovieListDetail[]) =>
          lists.map((l) => (l.id === id ? { ...l, isCollected: true, collectionCount: l.collectionCount + 1 } : l));
        return {
          lists: updateList(state.lists),
          currentList: state.currentList?.id === id ? { ...state.currentList, isCollected: true, collectionCount: state.currentList.collectionCount + 1 } : state.currentList,
        };
      });
      return true;
    } catch {
      return false;
    }
  },

  uncollectList: async (id) => {
    try {
      await request.delete(`/lists/${id}/collect`);
      set((state) => {
        const updateList = (lists: MovieListDetail[]) =>
          lists.map((l) => (l.id === id ? { ...l, isCollected: false, collectionCount: Math.max(0, l.collectionCount - 1) } : l));
        return {
          lists: updateList(state.lists),
          currentList: state.currentList?.id === id ? { ...state.currentList, isCollected: false, collectionCount: Math.max(0, state.currentList.collectionCount - 1) } : state.currentList,
          collectedLists: state.collectedLists.filter((l) => l.id !== id),
        };
      });
      return true;
    } catch {
      return false;
    }
  },

  addComment: async (listId, content) => {
    try {
      await request.post(`/lists/${listId}/comments`, { listId, content });
      get().fetchComments(listId);
      set((state) => {
        if (state.currentList?.id === listId) {
          return { currentList: { ...state.currentList, commentCount: state.currentList.commentCount + 1 } };
        }
        return {};
      });
    } catch {}
  },

  fetchComments: async (listId, page = 1, size = 10) => {
    try {
      const data: any = await request.get(`/lists/${listId}/comments`, { params: { page, size } });
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      set({ comments: list });
    } catch {}
  },

  deleteComment: async (commentId) => {
    try {
      await request.delete(`/lists/comments/${commentId}`);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId),
      }));
    } catch {}
  },

  addMovieToList: async (listId, movieId, sortOrder, tag) => {
    try {
      await request.post(`/lists/${listId}/movies`, { movieId, sortOrder, tag });
      get().fetchListDetail(listId);
      return true;
    } catch {
      return false;
    }
  },

  removeMovieFromList: async (listId, movieId) => {
    try {
      await request.delete(`/lists/${listId}/movies/${movieId}`);
      get().fetchListDetail(listId);
      return true;
    } catch {
      return false;
    }
  },

  generateYearReview: async () => {
    try {
      const res: any = await request.post('/lists/year-review');
      return res.data;
    } catch {
      return null;
    }
  },
}));

export default useMovieListStore;
