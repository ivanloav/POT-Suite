import api from './api';

export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: { userName: string };
  updater?: { userName: string };
}

export interface CreatePermissionData {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionData {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

const permissionsAdminService = {
  getAll: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions-admin');
    return response.data.data;
  },

  getById: async (id: number): Promise<Permission> => {
    const response = await api.get(`/permissions-admin/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePermissionData): Promise<Permission> => {
    const response = await api.post('/permissions-admin', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdatePermissionData): Promise<Permission> => {
    const response = await api.put(`/permissions-admin/${id}`, data);
    return response.data.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/permissions-admin/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/permissions-admin/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/permissions-admin/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default permissionsAdminService;
