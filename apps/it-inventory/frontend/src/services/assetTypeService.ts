import api from './api';

export interface AssetType {
  id: number;
  name: string;
  sortOrder: number;
  isAssignable: boolean;
  supportsOs: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export const assetTypeService = {
  getAll: async (params?: { isActive?: boolean }) => {
    const response = await api.get('/asset-types', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-types/${id}`);
    return response.data;
  },

  create: async (data: { name: string; sortOrder?: number; isAssignable?: boolean; supportsOs?: boolean; isActive?: boolean }) => {
    const response = await api.post('/asset-types', data);
    return response.data;
  },

  update: async (id: number, data: { name?: string; sortOrder?: number; isAssignable?: boolean; supportsOs?: boolean; isActive?: boolean }) => {
    const response = await api.put(`/asset-types/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-types/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-types/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/asset-types/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-types/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
