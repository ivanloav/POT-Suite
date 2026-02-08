import api from './api';

export interface User {
  id: number;
  userName: string;
  email: string;
  language?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userSites?: Array<{ siteId: number }>;
  userSiteRoles?: Array<{ role?: { id: number } }>;
  creator?: { userName: string };
  updater?: { userName: string };
}

export interface CreateUserData {
  userName: string;
  email: string;
  password: string;
  language?: string;
  isActive?: boolean;
  siteIds?: number[];
  roleIds?: number[];
}

export interface UpdateUserData {
  userName?: string;
  email?: string;
  password?: string;
  language?: string;
  isActive?: boolean;
  siteIds?: number[];
  roleIds?: number[];
}

const usersAdminService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users-admin');
    return response.data.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users-admin/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await api.post('/users-admin', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await api.put(`/users-admin/${id}`, data);
    return response.data.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/users-admin/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/users-admin/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users-admin/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default usersAdminService;
