import api from './api';

export interface BrandCpuCompatibility {
  brandId: number;
  cpuVendorId: number;
  brand?: { name: string };
  cpuVendor?: { name: string };
  creator?: { userName: string };
  createdAt: Date;
}

export const brandCpuCompatibilityService = {
  getByBrand: async (brandId: number): Promise<{ data: BrandCpuCompatibility[] }> => {
    const response = await api.get(`/asset-brand-cpu-compatibility/brand/${brandId}`);
    return response.data;
  },

  create: async (data: { brandId: number; cpuVendorId: number }): Promise<{ data: BrandCpuCompatibility }> => {
    const response = await api.post('/asset-brand-cpu-compatibility', data);
    return response.data;
  },

  delete: async (data: { brandId: number; cpuVendorId: number }): Promise<void> => {
    await api.delete('/asset-brand-cpu-compatibility', { data });
  },
};
