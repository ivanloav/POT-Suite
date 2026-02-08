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

import { sitesService } from './sitesService';

describe('sitesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets all sites', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await sitesService.getAll();
    expect(apiMock.get).toHaveBeenCalledWith('/sites');
    expect(data).toEqual({ ok: true });
  });

  it('gets my sites', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await sitesService.getMySites();
    expect(apiMock.get).toHaveBeenCalledWith('/sites/my-sites');
    expect(data).toEqual({ ok: true });
  });

  it('gets site by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { siteId: 1 } });

    const data = await sitesService.getById(1);
    expect(apiMock.get).toHaveBeenCalledWith('/sites/1');
    expect(data).toEqual({ siteId: 1 });
  });
});
