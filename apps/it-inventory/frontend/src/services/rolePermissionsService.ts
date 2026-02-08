import api from './api';

export interface RolePermission {
  roleId: number;
  permissionId: number;
  role?: {
    id: number;
    name: string;
  };
  permission?: {
    id: number;
    name: string;
    code: string;
  };
}

export const rolePermissionsService = {
  getByRole: async (roleId: number): Promise<{ data: RolePermission[] }> => {
    const response = await api.get(`/role-permissions/role/${roleId}`);
    return response.data;
  },

  create: async (data: { roleId: number; permissionId: number }): Promise<{ data: RolePermission }> => {
    const response = await api.post('/role-permissions', data);
    return response.data;
  },

  delete: async (data: { roleId: number; permissionId: number }): Promise<void> => {
    await api.delete('/role-permissions', { data });
  },
};
