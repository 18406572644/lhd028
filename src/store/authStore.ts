import { create } from 'zustand';
import request from '@/utils/request';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
}

interface CaptchaData {
  captchaKey: string;
  captchaImage: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, nickname: string, captchaKey: string, captchaCode: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initAuth: () => void;
  getCaptcha: () => Promise<CaptchaData>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  isLoggedIn: false,

  initAuth: () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, refreshToken, user, isLoggedIn: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const data: any = await request.post('/auth/login', { username, password });
      const responseData = data.data || data;
      const token = responseData?.token;
      const refreshToken = responseData?.refreshToken;
      const user = responseData?.user;
      if (!token) {
        throw new Error('登录响应缺少令牌');
      }
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user || {}));
      set({ token, refreshToken: refreshToken || null, user: user || null, isLoggedIn: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (username, password, nickname, captchaKey, captchaCode) => {
    set({ loading: true });
    try {
      const data: any = await request.post(`/auth/register?captchaKey=${encodeURIComponent(captchaKey)}&captchaCode=${encodeURIComponent(captchaCode)}`, { username, password, nickname });
      const responseData = data.data || data;
      const token = responseData?.token;
      const refreshToken = responseData?.refreshToken;
      const user = responseData?.user;
      if (!token) {
        throw new Error('注册响应缺少令牌');
      }
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user || {}));
      set({ token, refreshToken: refreshToken || null, user: user || null, isLoggedIn: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, refreshToken: null, isLoggedIn: false });
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

  getCaptcha: async () => {
    const data: any = await request.get('/auth/captcha');
    return data.data || data;
  },
}));

export default useAuthStore;
