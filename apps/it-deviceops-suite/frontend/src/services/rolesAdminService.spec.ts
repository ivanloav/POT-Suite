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

import rolesAdminService from './rolesAdminService';

describe('rolesAdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets all roles', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } });

    const data = await rolesAdminService.getAll();
    expect(apiMock.get).toHaveBeenCalledWith('/roles-admin');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('gets role by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: { id: 2 } } });

    const data = await rolesAdminService.getById(2);
    expect(apiMock.get).toHaveBeenCalledWith('/roles-admin/2');
    expect(data).toEqual({ id: 2 });
  });

  it('creates role', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { id: 3 } } });

    const payload = { code: 'admin', name: 'Admin' };
    const data = await rolesAdminService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/roles-admin', payload);
    expect(data).toEqual({ id: 3 });
  });

  it('updates role', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { data: { id: 4 } } });

    const data = await rolesAdminService.update(4, { name: 'Updated' });
    expect(apiMock.put).toHaveBeenCalledWith('/roles-admin/4', { name: 'Updated' });
    expect(data).toEqual({ id: 4 });
  });
});
