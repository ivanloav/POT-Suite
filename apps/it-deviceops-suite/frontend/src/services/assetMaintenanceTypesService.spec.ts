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

import { assetMaintenanceTypesService } from './assetMaintenanceTypesService';

describe('assetMaintenanceTypesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets types with params', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetMaintenanceTypesService.getAll({ isActive: true });
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-types', { params: { isActive: true } });
    expect(data).toEqual({ ok: true });
  });

  it('gets type by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: 1 } });

    const data = await assetMaintenanceTypesService.getById(1);
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-types/1');
    expect(data).toEqual({ id: 1 });
  });

  it('creates type', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 2 } });

    const payload = { code: 'printer', name: 'Printer' };
    const data = await assetMaintenanceTypesService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-maintenance-types', payload);
    expect(data).toEqual({ id: 2 });
  });

  it('updates type', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetMaintenanceTypesService.update(3, { name: 'Updated' });
    expect(apiMock.put).toHaveBeenCalledWith('/asset-maintenance-types/3', { name: 'Updated' });
    expect(data).toEqual({ ok: true });
  });

  it('exports and downloads template', async () => {
    const blob = new Blob(['x']);
    apiMock.get.mockResolvedValueOnce({ data: blob });

    const exportBlob = await assetMaintenanceTypesService.exportToExcel();
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-types/export/excel', { responseType: 'blob' });
    expect(exportBlob).toBe(blob);

    apiMock.get.mockResolvedValueOnce({ data: blob });
    const templateBlob = await assetMaintenanceTypesService.downloadTemplate();
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-types/template/excel', { responseType: 'blob' });
    expect(templateBlob).toBe(blob);
  });
});
