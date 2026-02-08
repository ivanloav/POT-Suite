//import { get } from 'node_modules/axios/index.d.cts';
import api from './api';

export interface AssetCpuVendor {
  id: number;
  code: string;
  name: string;
}

export interface AssetCpuSegment {
  id: number;
  code: string;
  name: string;
}

export interface AssetCpuService {
  id: number;
  vendorId: number;
  vendor?: AssetCpuVendor;
  model: string;
  segmentId?: number;
  segment?: AssetCpuSegment;
  cores?: number;
  threads?: number;
  baseGhz?: number;
  boostGhz?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AssetCpuService = {
  getAll: async (params: { isActive?: boolean; siteId?: number; page?: number; limit?: number }) => {
    const response = await api.get('/asset-cpu', { params });
    return response.data;
  },

  getVendors: async () => {
    const response = await api.get('/asset-cpu/vendors');
    return response.data;
  },

  getSegments: async () => {
    const response = await api.get('/asset-cpu/segments');
    return response.data;
  },

  getCpu: async (vendorId?: number, brandId?: number, typeId?: number) => {
    const params: any = { isActive: true };
    if (vendorId) {
      params.vendorId = vendorId;
    }
    if (brandId) {
      params.brandId = brandId;
    }
    if (typeId) {
      params.typeId = typeId;
    }
    const response = await api.get('/asset-cpu', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-cpu/${id}`);
    return response.data;
  },

  create: async (data: { 
    vendorId: number; 
    model: string; 
    segmentId?: number; 
    cores?: number; 
    threads?: number; 
    baseGhz?: number; 
    boostGhz?: number; 
    notes?: string;
    isActive?: boolean 
  }) => {
    // Filtrar valores undefined/null
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const response = await api.post('/asset-cpu', payload);
    return response.data;
  },

  update: async (id: number, data: { vendorId?: number; model?: string; segmentId?: number; cores?: number; threads?: number; baseGhz?: number; boostGhz?: number; isActive?: boolean }) => {
    const response = await api.put(`/asset-cpu/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-cpu/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-cpu/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/asset-cpu/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-cpu/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
