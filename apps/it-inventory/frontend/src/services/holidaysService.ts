import api from './api';

export interface Holiday {
  id: number;
  date: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export const holidaysService = {
  getAll: async (params?: { isActive?: boolean }) => {
    const response = await api.get('/holidays', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/holidays/${id}`);
    return response.data;
  },

  create: async (data: { date: string; name: string; description?: string; isActive?: boolean }) => {
    const response = await api.post('/holidays', data);
    return response.data;
  },

  update: async (
    id: number,
    data: { date?: string; name?: string; description?: string; isActive?: boolean },
  ) => {
    const response = await api.put(`/holidays/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/holidays/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/holidays/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/holidays/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/holidays/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
