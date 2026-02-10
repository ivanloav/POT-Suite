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

import { assetMaintenanceTypeService } from './assetMaintenanceTypeService';

describe('assetMaintenanceTypeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets maintenance types with params', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { items: [] } });

    const data = await assetMaintenanceTypeService.getAll({ isActive: true });
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-types', {
      params: { isActive: true },
    });
    expect(data).toEqual({ items: [] });
  });

  it('creates a maintenance type', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 1 } });

    const payload = { code: 'printer_cleaning', name: 'Limpieza' };
    const data = await assetMaintenanceTypeService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-maintenance-types', payload);
    expect(data).toEqual({ id: 1 });
  });

  it('imports maintenance types from excel', async () => {
    const blob = new Blob(['file']);
    apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

    const file = new File([blob], 'types.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const data = await assetMaintenanceTypeService.importFromExcel(file);
    expect(apiMock.post).toHaveBeenCalledWith(
      '/asset-maintenance-types/import/excel',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    expect(data).toEqual({ ok: true });
  });

  it('exports and downloads template', async () => {
    const blob = new Blob(['x']);
    apiMock.get.mockResolvedValueOnce({ data: blob });

    const exportBlob = await assetMaintenanceTypeService.exportToExcel();
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-types/export/excel', {
      responseType: 'blob',
    });
    expect(exportBlob).toBe(blob);

    apiMock.get.mockResolvedValueOnce({ data: blob });
    const templateBlob = await assetMaintenanceTypeService.downloadTemplate();
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-types/template/excel', {
      responseType: 'blob',
    });
    expect(templateBlob).toBe(blob);
  });

  it('updates duplicates from excel', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

    const duplicates = [{ code: 'printer', name: 'Printer' }];
    const data = await assetMaintenanceTypeService.updateDuplicatesFromExcel(duplicates);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-maintenance-types/update-duplicates-excel', {
      duplicates,
    });
    expect(data).toEqual({ ok: true });
  });
});
