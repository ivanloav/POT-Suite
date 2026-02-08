import api from './api';

export interface Site {
  siteId: number;
  code: string;
  name: string;
  isActive: boolean;
  creator?: { userName: string };
  updater?: { userName: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSiteDto {
  code: string;
  name: string;
  isActive?: boolean;
}

export interface UpdateSiteDto {
  code?: string;
  name?: string;
  isActive?: boolean;
}

export const sitesService = {
  getAll: async (): Promise<{ data: Site[] }> => {
    const response = await api.get('/sites');
    return response.data;
  },

  getById: async (id: number): Promise<{ data: Site }> => {
    const response = await api.get(`/sites/${id}`);
    return response.data;
  },

  create: async (data: CreateSiteDto): Promise<{ success: boolean; message: string; data: Site }> => {
    const response = await api.post('/sites', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSiteDto): Promise<{ success: boolean; message: string; data: Site }> => {
    const response = await api.put(`/sites/${id}`, data);
    return response.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/sites/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/sites/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File): Promise<{ success: boolean; message: string; data: any }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/sites/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default sitesService;
