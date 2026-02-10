import api from './api';

interface AssetStorageFormFactor {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export const assetStorageFormFactorService = {
  getAll: async (): Promise<AssetStorageFormFactor[]> => {
    const response = await api.get('/asset-storage-form-factors');
    return response.data.data;
  },

  getById: async (id: number): Promise<AssetStorageFormFactor> => {
    const response = await api.get(`/asset-storage-form-factors/${id}`);
    return response.data.data;
  },

  create: async (data: { code: string; name: string; isActive?: boolean }): Promise<AssetStorageFormFactor> => {
    const response = await api.post('/asset-storage-form-factors', data);
    return response.data.data;
  },

  update: async (id: number, data: { code?: string; name?: string; isActive?: boolean }): Promise<AssetStorageFormFactor> => {
    const response = await api.put(`/asset-storage-form-factors/${id}`, data);
    return response.data.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/asset-storage-form-factors/export/excel', { responseType: 'blob' });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/asset-storage-form-factors/template/excel', { responseType: 'blob' });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/asset-storage-form-factors/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-storage-form-factors/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
