import api from './api';

export interface Section {
  id: number;
  siteId: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  site?: { name: string };
  creator?: { userName: string };
  updater?: { userName: string };
}

export const sectionService = {
  getAll: async (params?: { isActive?: boolean; siteId?: number }) => {
    const response = await api.get('/sections', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/sections/${id}`);
    return response.data;
  },

  create: async (data: { siteId: number; name: string; sortOrder?: number; isActive?: boolean }) => {
    const response = await api.post('/sections', data);
    return response.data;
  },

  update: async (id: number, data: { name?: string; sortOrder?: number; isActive?: boolean }) => {
    const response = await api.put(`/sections/${id}`, data);
    return response.data;
  },

  exportToExcel: async (siteId?: number) => {
    const params = siteId ? { siteId } : {};
    const response = await api.get('/sections/export/excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/sections/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/sections/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/sections/update-duplicates-excel', { duplicates });
    return response.data;
  },

  getNextSortOrder: async (siteId: number): Promise<number> => {
    const response = await api.get<{ data: number }>('/sections/next-sort-order', {
      params: { siteId },
    });
    return response.data.data;
  },
};
