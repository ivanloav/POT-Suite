import api from './api';

export interface BrandOsCompatibility {
  brandId: number;
  osFamilyId: number;
  brand?: { name: string };
  osFamily?: { name: string };
  creator?: { userName: string };
  createdAt: Date;
}

export const brandOsCompatibilityService = {
  getByBrand: async (brandId: number): Promise<{ data: BrandOsCompatibility[] }> => {
    const response = await api.get(`/asset-brand-os-compatibility/brand/${brandId}`);
    return response.data;
  },

  create: async (data: { brandId: number; osFamilyId: number }): Promise<{ data: BrandOsCompatibility }> => {
    const response = await api.post('/asset-brand-os-compatibility', data);
    return response.data;
  },

  delete: async (data: { brandId: number; osFamilyId: number }): Promise<void> => {
    await api.delete('/asset-brand-os-compatibility', { data });
  },
};
