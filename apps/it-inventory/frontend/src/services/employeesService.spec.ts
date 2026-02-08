import { vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  default: apiMock,
}));

import { employeesService } from './employeesService';

describe('employeesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets employees with params', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await employeesService.getAll({ siteId: 1, isActive: true });
    expect(apiMock.get).toHaveBeenCalledWith('/employees', { params: { siteId: 1, isActive: true } });
    expect(data).toEqual({ ok: true });
  });

  it('gets employee by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: 9 } });

    const data = await employeesService.getById(9);
    expect(apiMock.get).toHaveBeenCalledWith('/employees/9');
    expect(data).toEqual({ id: 9 });
  });

  it('creates employee', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 2 } });

    const payload = { siteId: 1, firstName: 'Ana', lastName: 'Lopez' };
    const data = await employeesService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/employees', payload);
    expect(data).toEqual({ id: 2 });
  });

  it('updates employee', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { ok: true } });

    const data = await employeesService.update(3, { isActive: false });
    expect(apiMock.put).toHaveBeenCalledWith('/employees/3', { isActive: false });
    expect(data).toEqual({ ok: true });
  });

  it('deletes employee', async () => {
    apiMock.delete.mockResolvedValueOnce({ data: { ok: true } });

    const data = await employeesService.delete(4);
    expect(apiMock.delete).toHaveBeenCalledWith('/employees/4');
    expect(data).toEqual({ ok: true });
  });

  it('downloads template', async () => {
    const blob = new Blob(['x']);
    apiMock.get.mockResolvedValueOnce({ data: blob });

    const data = await employeesService.downloadTemplate();
    expect(apiMock.get).toHaveBeenCalledWith('/employees/template/excel', { responseType: 'blob' });
    expect(data).toBe(blob);
  });

  it('exports to excel', async () => {
    const blob = new Blob(['x']);
    apiMock.get.mockResolvedValueOnce({ data: blob });

    const data = await employeesService.exportToExcel();
    expect(apiMock.get).toHaveBeenCalledWith('/employees/export/excel', { responseType: 'blob' });
    expect(data).toBe(blob);
  });

  it('imports from excel', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { insertados: 1 } } });

    const data = await employeesService.importFromExcel([{ id: 1 }]);
    expect(apiMock.post).toHaveBeenCalledWith('/employees/import-excel', { employees: [{ id: 1 }] });
    expect(data).toEqual({ insertados: 1 });
  });

  it('updates duplicates from excel', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { actualizados: 2 } } });

    const data = await employeesService.updateDuplicatesFromExcel([{ id: 2 }]);
    expect(apiMock.post).toHaveBeenCalledWith('/employees/update-duplicates-excel', { duplicates: [{ id: 2 }] });
    expect(data).toEqual({ actualizados: 2 });
  });
});
