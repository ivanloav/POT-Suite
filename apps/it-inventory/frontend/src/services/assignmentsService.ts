import api from './api';

export interface Assignment {
  id: number;
  siteId: number;
  assetId: number;
  employeeId: number;
  assignedAt: string;
  returnedAt: string | null;
  comment: string | null;
  createdBy: number;
  asset: {
    id: number;
    assetTag: string;
    serialNumber: string;
    siteId: number;
    type: { name: string };
    model: { name: string; brand: { name: string } };
  };
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    siteId: number;
  };
  site: {
    siteId: number;
    code: string;
    name: string;
  };
}

export interface CreateAssignmentDto {
  siteId: number;
  assetId: number;
  employeeId: number;
  assignedAt?: string;
  comment?: string;
}

export interface ReturnAssignmentDto {
  returnedAt?: string;
  comment?: string;
}

export const assignmentsService = {
  getAll: async (siteId?: number) => {
    const response = await api.get('/assignments', {
      params: siteId ? { siteId } : {},
    });
    return response.data;
  },

  getActive: async (siteId?: number) => {
    const response = await api.get('/assignments/active', {
      params: siteId ? { siteId } : {},
    });
    return response.data;
  },

  create: async (data: CreateAssignmentDto) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  return: async (assignmentId: number, data?: ReturnAssignmentDto) => {
    const response = await api.post(`/assignments/${assignmentId}/return`, data || {});
    return response.data;
  },

  getByEmployee: async (employeeId: number) => {
    const response = await api.get(`/assignments/employee/${employeeId}`);
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/assignments/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  exportToExcel: async (): Promise<Blob> => {
    const response = await api.get('/assignments/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromExcel: async (data: any[]) => {
    const response = await api.post('/assignments/import/excel', { assignments: data });
    return response.data;
  },
};
