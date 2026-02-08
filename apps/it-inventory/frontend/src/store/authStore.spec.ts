import { useAuthStore } from './authStore';

describe('authStore', () => {
  afterEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthChecked: true,
      selectedSiteId: null,
    } as any);

    if (useAuthStore.persist?.clearStorage) {
      useAuthStore.persist.clearStorage();
    }
  });

  it('setAuth sets user and token', () => {
    const user = { id: 1, email: 'a@b.com', roles: [], permissions: [], sites: [] };
    useAuthStore.getState().setAuth(user as any, 'token-123');

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('a@b.com');
    expect(state.token).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('updateToken sets token and auth flag', () => {
    useAuthStore.getState().updateToken('token-xyz');
    const state = useAuthStore.getState();
    expect(state.token).toBe('token-xyz');
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout clears auth state', () => {
    useAuthStore.setState({
      user: { id: 1 } as any,
      token: 'token',
      isAuthenticated: true,
      isAuthChecked: true,
      selectedSiteId: 1,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.selectedSiteId).toBeNull();
  });

  it('hasPermission returns true when permission exists', () => {
    useAuthStore.setState({
      user: { permissions: ['assets.read'] } as any,
    });
    expect(useAuthStore.getState().hasPermission('assets.read')).toBe(true);
  });

  it('canManage returns true for manage permissions', () => {
    useAuthStore.setState({
      user: { permissions: ['assets.create'] } as any,
    });
    expect(useAuthStore.getState().canManage('assets')).toBe(true);
  });
});
