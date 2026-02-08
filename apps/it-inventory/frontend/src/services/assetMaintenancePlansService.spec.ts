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

import { assetMaintenancePlansService } from './assetMaintenancePlansService';

describe('assetMaintenancePlansService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets plans with params', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetMaintenancePlansService.getAll({ siteId: 1, isActive: true });
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-plans', {
      params: { siteId: 1, isActive: true },
    });
    expect(data).toEqual({ ok: true });
  });

  it('gets plan by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: 2 } });

    const data = await assetMaintenancePlansService.getById(2);
    expect(apiMock.get).toHaveBeenCalledWith('/asset-maintenance-plans/2');
    expect(data).toEqual({ id: 2 });
  });

  it('creates plan', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 1 } });

    const payload = { siteId: 1, assetId: 2, title: 'Limpieza', frequencyDays: 30, nextDueDate: '2026-02-20' };
    const data = await assetMaintenancePlansService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-maintenance-plans', payload);
    expect(data).toEqual({ id: 1 });
  });

  it('updates plan', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetMaintenancePlansService.update(3, { title: 'Update' });
    expect(apiMock.put).toHaveBeenCalledWith('/asset-maintenance-plans/3', { title: 'Update' });
    expect(data).toEqual({ ok: true });
  });

  it('completes plan', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetMaintenancePlansService.complete(4, { notes: 'Ok' });
    expect(apiMock.post).toHaveBeenCalledWith('/asset-maintenance-plans/4/complete', { notes: 'Ok' });
    expect(data).toEqual({ ok: true });
  });
});
