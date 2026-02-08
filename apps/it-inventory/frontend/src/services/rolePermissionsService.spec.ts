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

import { rolePermissionsService } from './rolePermissionsService';

describe('rolePermissionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets permissions by role', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [] } });

    const data = await rolePermissionsService.getByRole(2);
    expect(apiMock.get).toHaveBeenCalledWith('/role-permissions/role/2');
    expect(data).toEqual({ data: [] });
  });

  it('creates a role permission', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { roleId: 1, permissionId: 2 } } });

    const payload = { roleId: 1, permissionId: 2 };
    const data = await rolePermissionsService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/role-permissions', payload);
    expect(data).toEqual({ data: { roleId: 1, permissionId: 2 } });
  });

  it('deletes a role permission', async () => {
    apiMock.delete.mockResolvedValueOnce({});

    const payload = { roleId: 1, permissionId: 2 };
    await rolePermissionsService.delete(payload);
    expect(apiMock.delete).toHaveBeenCalledWith('/role-permissions', { data: payload });
  });
});
