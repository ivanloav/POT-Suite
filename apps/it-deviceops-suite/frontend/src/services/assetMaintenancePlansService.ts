import api from './api';

export interface AssetMaintenancePlan {
  id: number;
  siteId: number;
  assetId: number;
  title: string;
  maintenanceType?: string;
  priority?: string;
  description?: string;
  isRecurring?: boolean;
  frequencyDays?: number | null;
  nextDueDate: string;
  lastDoneAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: number;
    assetTag: string;
    serial?: string;
  };
  creator?: { userName: string };
  updater?: { userName: string };
}

export interface CreateAssetMaintenancePlanData {
  siteId: number;
  assetId: number;
  title: string;
  maintenanceType?: string;
  priority?: string;
  description?: string;
  isRecurring?: boolean;
  frequencyDays?: number | null;
  nextDueDate: string;
  isActive?: boolean;
}

export interface UpdateAssetMaintenancePlanData extends Partial<CreateAssetMaintenancePlanData> {
  lastDoneAt?: string;
}

export interface CompleteAssetMaintenanceData {
  performedAt?: string;
  status?: string;
  notes?: string;
  incidents?: string;
}

export const assetMaintenancePlansService = {
  getAll: async (params?: {
    siteId?: number;
    assetId?: number;
    isActive?: boolean;
    from?: string;
    to?: string;
  }) => {
    const response = await api.get('/asset-maintenance-plans', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/asset-maintenance-plans/${id}`);
    return response.data;
  },

  create: async (data: CreateAssetMaintenancePlanData) => {
    const response = await api.post('/asset-maintenance-plans', data);
    return response.data;
  },

  update: async (id: number, data: UpdateAssetMaintenancePlanData) => {
    const response = await api.put(`/asset-maintenance-plans/${id}`, data);
    return response.data;
  },

  complete: async (id: number, data: CompleteAssetMaintenanceData) => {
    const response = await api.post(`/asset-maintenance-plans/${id}/complete`, data);
    return response.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/asset-maintenance-plans/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/asset-maintenance-plans/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (plans: any[]): Promise<any> => {
    const response = await api.post('/asset-maintenance-plans/import-excel', { plans });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]): Promise<any> => {
    const response = await api.post('/asset-maintenance-plans/import-excel/update-duplicates', { duplicates });
    return response.data;
  },

  duplicate: async (id: number): Promise<any> => {
    const response = await api.post(`/asset-maintenance-plans/${id}/duplicate`);
    return response.data;
  },

  applyToMultipleAssets: async (planId: number, assetIds: number[]): Promise<any> => {
    const response = await api.post('/asset-maintenance-plans/apply-to-assets', { planId, assetIds });
    return response.data;
  },
};
