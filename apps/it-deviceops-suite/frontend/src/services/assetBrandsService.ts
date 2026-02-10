import api from './api';

export interface AssetBrand {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const assetBrandsService = {
  getAll: async () => {
    const response = await api.get('/asset-brands');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-brands/${id}`);
    return response.data;
  },

  create: async (data: { name: string; isActive: boolean }) => {
    const response = await api.post('/asset-brands', data);
    return response.data;
  },

  update: async (id: number, data: { name?: string; isActive?: boolean }) => {
    const response = await api.put(`/asset-brands/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-brands/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-brands/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/asset-brands/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-brands/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
