import api from './api';

export interface TypeOsCompatibility {
  typeId: number;
  osFamilyId: number;
  type?: { name: string };
  osFamily?: { name: string };
  creator?: { userName: string };
  createdAt: Date;
}

export const typeOsCompatibilityService = {
  getByType: async (typeId: number): Promise<{ data: TypeOsCompatibility[] }> => {
    const response = await api.get(`/asset-type-os-compatibility/type/${typeId}`);
    return response.data;
  },

  create: async (data: { typeId: number; osFamilyId: number }): Promise<{ data: TypeOsCompatibility }> => {
    const response = await api.post('/asset-type-os-compatibility', data);
    return response.data;
  },

  delete: async (data: { typeId: number; osFamilyId: number }): Promise<void> => {
    await api.delete('/asset-type-os-compatibility', { data });
  },
};
