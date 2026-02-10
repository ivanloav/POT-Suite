import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { refreshAccessToken } from '@/services/tokenService';
import { SUITE_LOGIN_URL } from '@/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar el token JWT desde el store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = (error.config || {}) as { _retry?: boolean; url?: string; headers?: any };

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        useAuthStore.getState().updateToken(token);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (!window.location.href.includes(SUITE_LOGIN_URL)) {
          window.location.href = SUITE_LOGIN_URL;
        }
        return Promise.reject(refreshError);
      }
    }

    // Solo redirigir a login si es 401 Y NO estamos ya en la página de login
    if (error.response?.status === 401 && !window.location.href.includes(SUITE_LOGIN_URL)) {
      useAuthStore.getState().logout();
      window.location.href = SUITE_LOGIN_URL;
    }
    return Promise.reject(error);
  }
);

export default api;
