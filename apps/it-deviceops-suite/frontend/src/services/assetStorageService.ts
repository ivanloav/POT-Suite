import api from './api';

export interface AssetStorageOption {
  id: number;
  capacityGb: number;
  driveTypeId: number;
  driveType?: { id: number; name: string };
  interfaceId: number | null;
  interface?: { id: number; name: string } | null;
  formFactorId: number | null;
  formFactor?: { id: number; name: string } | null;
  notes?: string;
  isActive: boolean;
  creator?: { userName: string };
  updater?: { userName: string };
  createdAt: string;
  updatedAt: string;
}

export const AssetStorageService = {
  getAll: async (params: { isActive?: boolean; siteId?: number }) => {
    const response = await api.get('/asset-storage', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-storage/${id}`);
    return response.data;
  },

  create: async (data: { 
    capacityGb: number; 
    driveTypeId: number; 
    interfaceId?: number; 
    formFactorId?: number; 
    notes?: string;
    isActive?: boolean;
  }) => {
    // Filtrar valores undefined/null
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const response = await api.post('/asset-storage', payload);
    return response.data;
  },

  update: async (id: number, data: { 
    capacityGb?: number; 
    driveTypeId?: number; 
    interfaceId?: number; 
    formFactorId?: number; 
    notes?: string; 
    isActive?: boolean 
  }) => {
    const response = await api.put(`/asset-storage/${id}`, data);
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/asset-storage/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/asset-storage/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/asset-storage/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-storage/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
