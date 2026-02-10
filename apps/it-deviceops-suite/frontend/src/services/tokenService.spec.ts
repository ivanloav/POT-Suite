import { vi } from 'vitest';

const postMock = vi.fn();
const createMock = vi.fn(() => ({ post: postMock }));

vi.mock('axios', () => ({
  default: {
    create: createMock,
  },
}));

const importService = async () => {
  const mod = await import('./tokenService');
  return mod.refreshAccessToken;
};

describe('tokenService', () => {
  beforeEach(() => {
    postMock.mockReset();
    createMock.mockClear();
    vi.resetModules();
  });

  it('returns token from refresh response', async () => {
    postMock.mockResolvedValueOnce({ data: { token: 'abc' } });
    const refreshAccessToken = await importService();

    const token = await refreshAccessToken();
    expect(token).toBe('abc');
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent refresh calls', async () => {
    let resolvePromise: (val: any) => void;
    const pending = new Promise((resolve) => { resolvePromise = resolve; });
    postMock.mockReturnValueOnce(pending as any);
    const refreshAccessToken = await importService();

    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();

    resolvePromise!({ data: { token: 'shared-token' } });

    const [t1, t2] = await Promise.all([p1, p2]);
    expect(t1).toBe('shared-token');
    expect(t2).toBe('shared-token');
    expect(postMock).toHaveBeenCalledTimes(1);
  });
});
