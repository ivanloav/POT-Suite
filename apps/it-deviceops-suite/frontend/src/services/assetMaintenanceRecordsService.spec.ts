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

import { assetMaintenanceRecordsService } from './assetMaintenanceRecordsService';

describe('assetMaintenanceRecordsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets records with params', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetMaintenanceRecordsService.getAll({ siteId: 1 });
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-records', { params: { siteId: 1 } });
    expect(data).toEqual({ ok: true });
  });

  it('gets record by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: 5 } });

    const data = await assetMaintenanceRecordsService.getById(5);
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-records/5');
    expect(data).toEqual({ id: 5 });
  });
});
