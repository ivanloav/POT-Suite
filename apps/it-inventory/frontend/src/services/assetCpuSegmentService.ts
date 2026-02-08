import api from './api';

export interface AssetCpuSegment {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export const assetCpuSegmentService = {
  getAll: async () => {
    const response = await api.get('/asset-cpu-segments');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-cpu-segments/${id}`);
    return response.data;
  },

  create: async (data: { code: string; name: string; isActive?: boolean }) => {
    const response = await api.post('/asset-cpu-segments', data);
    return response.data;
  },

  update: async (id: number, data: { code?: string; name?: string; isActive?: boolean }) => {
    const response = await api.put(`/asset-cpu-segments/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-cpu-segments/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-cpu-segments/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/asset-cpu-segments/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-cpu-segments/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
