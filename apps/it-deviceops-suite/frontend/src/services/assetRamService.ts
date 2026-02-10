//import { get } from 'node_modules/axios/index.d.cts';
import api from './api';

export interface AssetRamService {
  id: number;
  capacityGb: number;
  memTypeId: number;
  speedMts?: number;
  formFactorId: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AssetRamService = {
  getAll: async (params: { isActive?: boolean; siteId?: number; page?: number; limit?: number }) => {
    const response = await api.get('/asset-ram', { params });
    return response.data;
  },

  getMemoryTypes: async () => {
    const response = await api.get('/asset-ram/memory-types');
    return response.data;
  },

  getFormFactors: async () => {
    const response = await api.get('/asset-ram/form-factors');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-ram/${id}`);
    return response.data;
  },

  create: async (data: { 
    capacityGb: number; 
    memTypeId: number; 
    speedMts?: number; 
    formFactorId?: number; 
    notes?: string;
    isActive?: boolean;
  }) => {
    // Filtrar valores undefined/null
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const response = await api.post('/asset-ram', payload);
    return response.data;
  },

  update: async (id: number, data: { capacityGb?: number; memTypeId?: number; speedMts?: number; formFactorId?: number; notes?: string; isActive?: boolean }) => {
    const response = await api.put(`/asset-ram/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-ram/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-ram/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/asset-ram/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-ram/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
