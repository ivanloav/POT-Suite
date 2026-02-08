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

import permissionsAdminService from './permissionsAdminService';

describe('permissionsAdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets all permissions', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } });

    const data = await permissionsAdminService.getAll();
    expect(apiMock.get).toHaveBeenCalledWith('/permissions-admin');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('gets permission by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: { id: 2 } } });

    const data = await permissionsAdminService.getById(2);
    expect(apiMock.get).toHaveBeenCalledWith('/permissions-admin/2');
    expect(data).toEqual({ id: 2 });
  });

  it('creates permission', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { id: 3 } } });

    const payload = { code: 'assets.read', name: 'Ver activos' };
    const data = await permissionsAdminService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/permissions-admin', payload);
    expect(data).toEqual({ id: 3 });
  });

  it('updates permission', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { data: { id: 4 } } });

    const data = await permissionsAdminService.update(4, { name: 'Updated' });
    expect(apiMock.put).toHaveBeenCalledWith('/permissions-admin/4', { name: 'Updated' });
    expect(data).toEqual({ id: 4 });
  });
});
