import api from './api';

export interface AssetOSFamilies {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AssetOsFamiliesService = {
  getAll: async () => {
    const response = await api.get('/os-families');
    return response.data;
  },

  getFamilyById: async (id: number) => {
    const response = await api.get(`/os-families/${id}`);
    return response.data;
  },

  createFamily: async (data: { name: string; isActive: boolean }) => {
    const response = await api.post('/os-families', data);
    return response.data;
  },

  updateFamily: async (id: number, data: { name?: string; isActive?: boolean }) => {
    const response = await api.put(`/os-families/${id}`, data);
    return response.data;
  },

  exportFamiliesToExcel: async () => {
    const response = await api.get('/os-families/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadFamiliesTemplate: async () => {
    const response = await api.get('/os-families/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFamiliesFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/os-families/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/os-families/update-duplicates-excel', { duplicates })
    return response.data;
  },
};
