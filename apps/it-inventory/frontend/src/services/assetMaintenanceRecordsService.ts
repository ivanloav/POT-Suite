import api from './api';

export interface AssetMaintenanceRecord {
  id: number;
  planId: number;
  siteId: number;
  assetId: number;
  performedAt: string;
  status: string;
  notes?: string;
  incidents?: string;
  createdAt: string;
  plan?: { id: number; title: string };
  asset?: { id: number; assetTag: string };
  creator?: { userName: string };
}

export const assetMaintenanceRecordsService = {
  getAll: async (params?: {
    siteId?: number;
    assetId?: number;
    planId?: number;
    from?: string;
    to?: string;
  }) => {
    const response = await api.get('/asset-maintenance-records', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-maintenance-records/${id}`);
    return response.data;
  },
};
