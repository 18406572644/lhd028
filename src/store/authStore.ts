import { create } from 'zustand';
import request from '@/utils/request';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initAuth: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  isLoggedIn: false,

  initAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isLoggedIn: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const data: any = await request.post('/auth/login', { username, password });
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoggedIn: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (username, password, nickname) => {
    set({ loading: true });
    try {
      const data: any = await request.post('/auth/register', { username, password, nickname });
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoggedIn: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoggedIn: false });
  },

  fetchUser: async () => {
    try {
      const data: any = await request.get('/auth/info');
      const user = data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch {
      get().logout();
    }
  },
}));

export default useAuthStore;
