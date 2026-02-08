import api from './api';

export interface Site {
  siteId: number;
  code: string;
  name: string;
  isActive: boolean;
}

export const sitesService = {
  getAll: async () => {
    const response = await api.get('/sites');
    return response.data;
  },

  getMySites: async () => {
    const response = await api.get('/sites/my-sites');
    return response.data;
  },

  getById: async (siteId: number) => {
    const response = await api.get(`/sites/${siteId}`);
    return response.data;
  },
};
