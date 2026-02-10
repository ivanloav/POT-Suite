import api from './api';

export interface AssetModel {
  id: number;
  typeId: number;
  brandId: number;
  model: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AssetModelService = {
  getAll: async (params: { isActive?: boolean; siteId?: number; page?: number; limit?: number }) => {
    const response = await api.get('/asset-models', { params });
    return response.data;
  },

  getModels: async (familyId?: number, brandId?: number, typeId?: number) => {
    const params: any = { isActive: true };
    if (familyId) {
      params.familyId = familyId;
    }
    if (brandId) {
      params.brandId = brandId;
    }
    if (typeId) {
      params.typeId = typeId;
    }
    const response = await api.get('/asset-models', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-models/${id}`);
    return response.data;
  },

  create: async (data: { typeId: number; brandId: number; model: string; isActive: boolean }) => {
    const response = await api.post('/asset-models', data);
    return response.data;
  },

  update: async (id: number, data: { typeId: number; brandId: number; model: string; isActive: boolean }) => {
    const response = await api.put(`/asset-models/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-models/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-models/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/asset-models/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-models/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
