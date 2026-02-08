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

import usersAdminService from './usersAdminService';

describe('usersAdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets all users', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } });

    const data = await usersAdminService.getAll();
    expect(apiMock.get).toHaveBeenCalledWith('/users-admin');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('gets user by id', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: { id: 2 } } });

    const data = await usersAdminService.getById(2);
    expect(apiMock.get).toHaveBeenCalledWith('/users-admin/2');
    expect(data).toEqual({ id: 2 });
  });

  it('creates user', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { id: 3 } } });

    const payload = { userName: 'Ivan', email: 'ivan@example.com', password: 'pass' };
    const data = await usersAdminService.create(payload as any);
    expect(apiMock.post).toHaveBeenCalledWith('/users-admin', payload);
    expect(data).toEqual({ id: 3 });
  });

  it('updates user', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { data: { id: 4 } } });

    const data = await usersAdminService.update(4, { userName: 'Updated' });
    expect(apiMock.put).toHaveBeenCalledWith('/users-admin/4', { userName: 'Updated' });
    expect(data).toEqual({ id: 4 });
  });
});
