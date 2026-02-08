import api from './api';

export interface Role {
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

export interface CreateRoleData {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

export interface UpdateRoleData {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

const rolesAdminService = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get('/roles-admin');
    return response.data.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get(`/roles-admin/${id}`);
    return response.data.data;
  },

  create: async (data: CreateRoleData): Promise<Role> => {
    const response = await api.post('/roles-admin', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateRoleData): Promise<Role> => {
    const response = await api.put(`/roles-admin/${id}`, data);
    return response.data.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/roles-admin/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/roles-admin/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/roles-admin/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default rolesAdminService;
