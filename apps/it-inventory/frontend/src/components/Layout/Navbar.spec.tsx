import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Navbar from './Navbar';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authService } from '@/services/authService';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/services/authService', () => ({
  authService: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Navbar', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    (authService.logout as any).mockClear();
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Iván',
          email: 'ivan@example.com',
          roles: [],
          permissions: [],
          sites: [],
        },
        isAuthenticated: true,
      });
      useThemeStore.setState({ theme: 'light' });
      document.documentElement.classList.remove('dark');
    });
    localStorage.clear();
  });

  it('shows the current user name', () => {
    render(<Navbar />);
    expect(screen.getByText('Iván')).toBeInTheDocument();
  });

  it('toggles theme and opens about modal', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await act(async () => {
      await user.click(screen.getByTitle('Cambiar a modo oscuro'));
    });
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await act(async () => {
      await user.click(screen.getByTitle('Acerca de'));
    });
    expect(screen.getByRole('heading', { name: 'Acerca de' })).toBeInTheDocument();
  });

  it('logs out and navigates to login', async () => {
    const user = userEvent.setup();
    const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');

    render(<Navbar />);
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /salir/i }));
    });

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });

    logoutSpy.mockRestore();
  });
});
