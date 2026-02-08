import api from './api';

interface AssetStorageDriveType {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export const assetStorageDriveTypeService = {
  getAll: async (): Promise<AssetStorageDriveType[]> => {
    const response = await api.get('/asset-storage-drive-types');
    return response.data.data;
  },

  getById: async (id: number): Promise<AssetStorageDriveType> => {
    const response = await api.get(`/asset-storage-drive-types/${id}`);
    return response.data.data;
  },

  create: async (data: { code: string; name: string; isActive?: boolean }): Promise<AssetStorageDriveType> => {
    const response = await api.post('/asset-storage-drive-types', data);
    return response.data.data;
  },

  update: async (id: number, data: { code?: string; name?: string; isActive?: boolean }): Promise<AssetStorageDriveType> => {
    const response = await api.put(`/asset-storage-drive-types/${id}`, data);
    return response.data.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/asset-storage-drive-types/export/excel', { responseType: 'blob' });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/asset-storage-drive-types/template/excel', { responseType: 'blob' });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/asset-storage-drive-types/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/asset-storage-drive-types/update-duplicates-excel', { duplicates });
    return response.data;
  },
};
