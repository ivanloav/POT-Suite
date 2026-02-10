import api from './api';

export interface AssetStatus {
  id: number;
  code: string;
  name: string;
  colorClass: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export const assetStatusService = {
  getAll: async (params?: { isActive?: boolean }) => {
    const response = await api.get('/asset-statuses', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-statuses/${id}`);
    return response.data;
  },

  create: async (data: { code: string; name: string; colorClass?: string; sortOrder?: number; isActive?: boolean }) => {
    const response = await api.post('/asset-statuses', data);
    return response.data;
  },

  update: async (id: number, data: { code?: string; name?: string; colorClass?: string; sortOrder?: number; isActive?: boolean }) => {
    const response = await api.put(`/asset-statuses/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-statuses/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-statuses/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/asset-statuses/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-statuses/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
