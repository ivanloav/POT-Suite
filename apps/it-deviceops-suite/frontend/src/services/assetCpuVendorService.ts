import api from './api';

export interface AssetCpuVendor {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export const assetCpuVendorService = {
  getAll: async () => {
    const response = await api.get('/asset-cpu-vendors');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-cpu-vendors/${id}`);
    return response.data;
  },

  create: async (data: { code: string; name: string; isActive?: boolean }) => {
    const response = await api.post('/asset-cpu-vendors', data);
    return response.data;
  },

  update: async (id: number, data: { code?: string; name?: string; isActive?: boolean }) => {
    const response = await api.put(`/asset-cpu-vendors/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-cpu-vendors/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-cpu-vendors/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/asset-cpu-vendors/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-cpu-vendors/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
