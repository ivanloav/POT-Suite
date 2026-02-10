import { vi } from 'vitest';
import { authService } from './authService';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

const refreshTokenMock = vi.hoisted(() => vi.fn());

vi.mock('./api', () => ({
  default: apiMock,
}));

vi.mock('@/services/tokenService', () => ({
  refreshAccessToken: refreshTokenMock,
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in with credentials', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { token: 't', user: { id: 1 } } });

    const data = await authService.login({ email: 'a@b.com', password: '123' });
    expect(apiMock.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: '123' });
    expect(data).toEqual({ token: 't', user: { id: 1 } });
  });

  it('refreshes token via tokenService', async () => {
    refreshTokenMock.mockResolvedValueOnce('new-token');

    const data = await authService.refresh();
    expect(refreshTokenMock).toHaveBeenCalled();
    expect(data).toEqual({ token: 'new-token' });
  });

  it('registers a user', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

    await authService.register({ email: 'c@d.com', password: 'pass' });
    expect(apiMock.post).toHaveBeenCalledWith('/auth/register', { email: 'c@d.com', password: 'pass' });
  });

  it('gets profile', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: 1 } });

    const data = await authService.getProfile();
    expect(apiMock.get).toHaveBeenCalledWith('/auth/profile');
    expect(data).toEqual({ id: 1 });
  });

  it('logs out and swallows errors', async () => {
    const error = new Error('boom');
    apiMock.post.mockRejectedValueOnce(error);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await authService.logout();
    expect(apiMock.post).toHaveBeenCalledWith('/auth/logout');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('refreshes session', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { token: 't2', user: { id: 2 } } });

    const data = await authService.refreshSession();
    expect(apiMock.get).toHaveBeenCalledWith('/auth/refresh-session');
    expect(data).toEqual({ token: 't2', user: { id: 2 } });
  });
});
