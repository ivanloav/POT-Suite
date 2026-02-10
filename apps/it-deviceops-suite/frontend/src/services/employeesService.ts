import api from './api';

export interface Employee {
  id: number;
  siteId: number;
  firstName: string;
  lastName: string;
  secondLastName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  site?: {
    siteId: number;
    code: string;
    name: string;
  };
  assignments?: any[];
}

export const employeesService = {
  getAll: async (params?: { isActive?: boolean; siteId?: number; page?: number; limit?: number }) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: {
    siteId: number;
    firstName: string;
    lastName: string;
    secondLastName?: string;
    email?: string;
    phone?: string;
    notes?: string;
  }) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      siteId?: number;
      firstName?: string;
      lastName?: string;
      secondLastName?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      notes?: string;
    }
  ) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/employees/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (employees: any[]) => {
    const response = await api.post('/employees/import-excel', { employees });
    return response.data.data;
  },

  updateDuplicatesFromExcel: async (duplicates: any[]) => {
    const response = await api.post('/employees/update-duplicates-excel', { duplicates });
    return response.data.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/employees/template/excel', {
      responseType: 'blob',
    });
    return response.data;
  },
};
