import api from './api';
import { refreshAccessToken } from '@/services/tokenService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  roleCode?: string;
  siteId?: number;
}

export interface User {
  id: number;
  userName?: string;
  email: string;
  roles: string[];
  permissions: string[];
  sites?: Array<{ siteId: number; siteName: string; roles: string[] }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  suiteLogin: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/suite-login');
    return response.data;
  },

  refresh: async (): Promise<{ token: string }> => {
    const token = await refreshAccessToken();
    return { token };
  },

  register: async (data: RegisterData): Promise<void> => {
    await api.post('/auth/register', data);
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error revocando refresh token:', error);
    }
  },

  refreshSession: async (): Promise<{ token: string; user: any }> => {
    const response = await api.get('/auth/refresh-session');
    return response.data;
  },
};
