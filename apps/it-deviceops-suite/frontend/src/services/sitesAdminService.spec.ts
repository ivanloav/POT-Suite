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

import { sitesService } from './sitesAdminService';

describe('sitesAdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets all sites', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ siteId: 1 }] } });

    const data = await sitesService.getAll();
    expect(apiMock.get).toHaveBeenCalledWith('/sites');
    expect(data).toEqual({ data: [{ siteId: 1 }] });
  });

  it('gets site by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: { siteId: 2 } } });

    const data = await sitesService.getById(2);
    expect(apiMock.get).toHaveBeenCalledWith('/sites/2');
    expect(data).toEqual({ data: { siteId: 2 } });
  });

  it('creates site', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: { siteId: 3 } } });

    const payload = { code: 'POT', name: 'Parcel' };
    const data = await sitesService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/sites', payload);
    expect(data).toEqual({ success: true, message: 'ok', data: { siteId: 3 } });
  });

  it('updates site', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: { siteId: 4 } } });

    const data = await sitesService.update(4, { name: 'Updated' });
    expect(apiMock.put).toHaveBeenCalledWith('/sites/4', { name: 'Updated' });
    expect(data).toEqual({ success: true, message: 'ok', data: { siteId: 4 } });
  });
});
