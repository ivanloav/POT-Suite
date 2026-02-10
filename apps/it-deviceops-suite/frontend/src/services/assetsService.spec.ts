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

import { assetsService } from './assetsService';

describe('assetsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets all assets with params', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetsService.getAll({ siteId: 2, page: 1 });
    expect(apiMock.get).toHaveBeenCalledWith('/assets', { params: { siteId: 2, page: 1 } });
    expect(data).toEqual({ ok: true });
  });

  it('gets asset by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: 3 } });

    const data = await assetsService.getById(3);
    expect(apiMock.get).toHaveBeenCalledWith('/assets/3');
    expect(data).toEqual({ id: 3 });
  });

  it('creates an asset', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 1 } });

    const payload = { siteId: 1, assetTag: 'A-1', typeId: 2 };
    const data = await assetsService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/assets', payload);
    expect(data).toEqual({ id: 1 });
  });

  it('updates an asset', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetsService.update(5, { location: 'Madrid' });
    expect(apiMock.put).toHaveBeenCalledWith('/assets/5', { location: 'Madrid' });
    expect(data).toEqual({ ok: true });
  });

  it('retires an asset', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assetsService.retire(7, 'old');
    expect(apiMock.post).toHaveBeenCalledWith('/assets/7/retire', { reason: 'old' });
    expect(data).toEqual({ ok: true });
  });

  it('downloads template', async () => {
    const blob = new Blob(['x']);
    apiMock.get.mockResolvedValueOnce({ data: blob });

    const data = await assetsService.downloadTemplate();
    expect(apiMock.get).toHaveBeenCalledWith('/assets/template/excel', { responseType: 'blob' });
    expect(data).toBe(blob);
  });

  it('imports from excel and returns data wrapper', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { insertados: 1 } } });

    const data = await assetsService.importFromExcel([{ id: 1 }]);
    expect(apiMock.post).toHaveBeenCalledWith('/assets/import-excel', { assets: [{ id: 1 }] });
    expect(data).toEqual({ insertados: 1 });
  });

  it('updates duplicates from excel', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { actualizados: 2 } } });

    const data = await assetsService.updateDuplicatesFromExcel([{ id: 2 }]);
    expect(apiMock.post).toHaveBeenCalledWith('/assets/import-excel/update-duplicates', { duplicates: [{ id: 2 }] });
    expect(data).toEqual({ actualizados: 2 });
  });
});
