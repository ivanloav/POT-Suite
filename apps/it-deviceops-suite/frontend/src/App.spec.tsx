import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import { useAuthStore } from './store/authStore';

vi.mock('./hooks/useInactivityLogout', () => ({
  useInactivityLogout: vi.fn(),
}));

vi.mock('./services/authService', () => ({
  authService: {
    refresh: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isAuthChecked: true,
      });
    });
  });

  it('renders login page when visiting /login', () => {
    window.history.pushState({}, 'Login', '/login');
    render(<App />);

    expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();
  });
});
