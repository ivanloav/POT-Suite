import api from './api';

export interface BrandRamCompatibility {
  brandId: number;
  ramTypeId: number;
  brand?: { name: string };
  ramType?: { name: string };
  creator?: { userName: string };
  createdAt: Date;
}

export const brandRamCompatibilityService = {
  getByBrand: async (brandId: number): Promise<{ data: BrandRamCompatibility[] }> => {
    const response = await api.get(`/asset-brand-ram-compatibility/brand/${brandId}`);
    return response.data;
  },

  create: async (data: { brandId: number; ramTypeId: number }): Promise<{ data: BrandRamCompatibility }> => {
    const response = await api.post('/asset-brand-ram-compatibility', data);
    return response.data;
  },

  delete: async (data: { brandId: number; ramTypeId: number }): Promise<void> => {
    await api.delete('/asset-brand-ram-compatibility', { data });
  },
};
