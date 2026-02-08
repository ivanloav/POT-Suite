import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

const renderWithRouter = (ui: React.ReactNode, initialEntries = ['/protected']) =>
  render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );

const setAuthState = (state: Partial<ReturnType<typeof useAuthStore.getState>>) => {
  act(() => {
    useAuthStore.setState(state as any);
  });
};

describe('ProtectedRoute', () => {
  afterEach(() => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthChecked: true,
      selectedSiteId: null,
    });
  });

  it('redirects to login when not authenticated', () => {
    setAuthState({ isAuthenticated: false, isAuthChecked: true });

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows access denied when missing permission', () => {
    setAuthState({
      isAuthenticated: true,
      isAuthChecked: true,
      user: { permissions: [] },
    });

    renderWithRouter(
      <ProtectedRoute permission="assets.read">
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
  });

  it('renders children when authenticated and authorized', () => {
    setAuthState({
      isAuthenticated: true,
      isAuthChecked: true,
      user: { permissions: ['assets.read'] },
    });

    renderWithRouter(
      <ProtectedRoute permission="assets.read">
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});
