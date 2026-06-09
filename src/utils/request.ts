import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;
      const errorType = data?.errorType;

      if (status === 401 && errorType === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            isRefreshing = false;
            clearAuthAndRedirect();
            return Promise.reject(error);
          }

          try {
            const res = await axios.post('/api/auth/refresh', { refreshToken });
            const responseData = res.data?.data || res.data;
            const newAccessToken = responseData?.token;
            const newRefreshToken = responseData?.refreshToken;

            if (newAccessToken) {
              localStorage.setItem('token', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              onTokenRefreshed(newAccessToken);
              isRefreshing = false;

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return request(originalRequest);
            } else {
              isRefreshing = false;
              clearAuthAndRedirect();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            isRefreshing = false;
            refreshSubscribers = [];
            clearAuthAndRedirect();
            return Promise.reject(refreshError);
          }
        }

        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(request(originalRequest));
          });
        });
      }

      if (status === 401) {
        clearAuthAndRedirect();
      } else if (status === 403) {
        message.error('没有权限访问');
      } else if (status === 404) {
        message.error('请求的资源不存在');
      } else if (status >= 500) {
        message.error('服务器错误，请稍后重试');
      } else {
        message.error(data?.message || '请求失败');
      }
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请稍后重试');
    } else {
      message.error('网络错误，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

function clearAuthAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
    message.error('登录已过期，请重新登录');
  }
}

export default request;
