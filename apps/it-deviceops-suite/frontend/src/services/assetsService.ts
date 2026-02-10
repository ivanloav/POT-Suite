  import api from './api';

export interface Asset {
  id: number;
  assetTag: string;
  serial?: string;
  imei?: string;
  status: string;
  type: { id: number; name: string };
  section?: { id: number; name: string };
  model?: { id: number; brand: { id: number; name: string }; model: string };
  osVersion?: { id: number; name: string; family: string };
  currentAssignment?: {
    id: number;
    employee: { id: number; name: string; email: string };
    assignedAt: string;
  };
  location?: string;
  notes?: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetData {
  siteId: number;
  assetTag: string;
  typeId: number;
  sectionId?: number;
  modelId?: number;
  osVersionId?: number;
  serial?: string;
  imei?: string;
  macAddress?: string;
  ipAddress?: string;
  uuid?: string;
  status?: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  location?: string;
  notes?: string;
}

export const assetsService = {
    importFromExcel: async (assets: any[]) => {
      // Aquí se asume que el backend tendrá un endpoint /assets/import-excel
      const response = await api.post('/assets/import-excel', { assets });
      return response.data.data; // Extraer la data del wrapper
    },

    updateDuplicatesFromExcel: async (duplicates: any[]) => {
      const response = await api.post('/assets/import-excel/update-duplicates', { duplicates });
      return response.data.data; // Extraer la data del wrapper
    },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/assets/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  getAll: async (params?: {
    status?: string;
    typeId?: number;
    sectionId?: number;
    siteId?: number;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  create: async (data: CreateAssetData) => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateAssetData>) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  retire: async (id: number, reason?: string) => {
    const response = await api.post(`/assets/${id}/retire`, { reason });
    return response.data;
  },
};
