import api from './api';

export interface AssetOSVersion {
  id: number;
  osFamilyId: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AssetOsVersionsService = {
  getAll: async (params: { isActive?: boolean; siteId?: number; page?: number; limit?: number }) => {
    const response = await api.get('/os-versions', { params });
    return response.data;
  },

  getOsVersions: async (familyId?: number, brandId?: number, typeId?: number) => {
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
    const response = await api.get('/os-versions', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/os-versions/${id}`);
    return response.data;
  },

  create: async (data: { osFamilyId: number; name: string; isActive: boolean }) => {
    const response = await api.post('/os-versions', data);
    return response.data;
  },

  update: async (id: number, data: { osFamilyId: number; name: string; isActive: boolean }) => {
    const response = await api.put(`/os-versions/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/os-versions/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/os-versions/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/os-versions/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/os-versions/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
