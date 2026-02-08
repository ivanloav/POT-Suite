import api from './api';

export const catalogsService = {
  getAssetTypes: async () => {
    const response = await api.get('/catalogs/asset-types');
    return response.data;
  },

  getAssetStatuses: async () => {
    const response = await api.get('/catalogs/asset-statuses');
    return response.data;
  },

  getSections: async (siteId?: number) => {
    const response = await api.get('/catalogs/sections', {
      params: { siteId },
    });
    return response.data;
  },

  getOsFamilies: async () => {
    const response = await api.get('/catalogs/os-families');
    return response.data;
  },

  getOsVersions: async (familyId?: number) => {
    const response = await api.get('/catalogs/os-versions', {
      params: { familyId },
    });
    return response.data;
  },

  getAssetModels: async (typeId?: number) => {
    const response = await api.get('/catalogs/asset-models', {
      params: { typeId },
    });
    return response.data;
  },

  createAssetModel: async (data: { typeId: number; brandId: number; model: string }) => {
    const response = await api.post('/catalogs/asset-models', data);
    return response.data;
  },

  getAssetBrands: async () => {
    const response = await api.get('/catalogs/asset-brands');
    return response.data;
  },

  createAssetBrand: async (data: { name: string }) => {
    const response = await api.post('/catalogs/asset-brands', data);
    return response.data;
  },

  getCpus: async (brandId?: number) => {
    const response = await api.get('/catalogs/cpus', {
      params: { brandId },
    });
    return response.data;
  },

  getRamOptions: async (brandId?: number) => {
    const response = await api.get('/catalogs/ram-options', {
      params: { brandId },
    });
    return response.data;
  },

  getStorageOptions: async () => {
    const response = await api.get('/catalogs/storage-options');
    return response.data;
  },
};
