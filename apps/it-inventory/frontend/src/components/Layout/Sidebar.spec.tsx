import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { sitesService } from '@/services/sitesService';

vi.mock('@/services/sitesService', () => ({
  sitesService: {
    getAll: vi.fn(),
  },
}));

const renderSidebar = (path = '/assets') => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
      },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Sidebar />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const baseUser = {
  id: 1,
  userName: 'Iván',
  email: 'ivan@example.com',
  roles: [],
  permissions: [],
  sites: [] as Array<{ siteId: number; code?: string; name?: string }>,
};

describe('Sidebar', () => {
  beforeEach(() => {
    (sitesService.getAll as any).mockResolvedValue({ data: [] });
    act(() => {
      useAuthStore.setState({
        user: baseUser,
        selectedSiteId: null,
        isAuthenticated: true,
      });
    });
  });

  it('shows only menu items with permission', () => {
    act(() => {
      useAuthStore.setState({
        user: { ...baseUser, permissions: ['assets.read'] },
      });
    });

    renderSidebar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
    expect(screen.queryByText('Empleados')).not.toBeInTheDocument();
    expect(screen.queryByText('Asignaciones')).not.toBeInTheDocument();
    expect(screen.queryByText('Catálogos')).not.toBeInTheDocument();
    expect(screen.queryByText('Administración')).not.toBeInTheDocument();
  });

  it('renders site selector when multiple sites are available', async () => {
    (sitesService.getAll as any).mockResolvedValue({
      data: [
        { siteId: 1, code: 'POT' },
        { siteId: 2, code: 'SCAMP' },
        { siteId: 3, code: 'OTHER' },
      ],
    });

    act(() => {
      useAuthStore.setState({
        user: { ...baseUser, sites: [{ siteId: 1 }, { siteId: 2 }] },
      });
    });

    renderSidebar();

    await waitFor(() => {
      expect(sitesService.getAll).toHaveBeenCalled();
    });

    await screen.findByRole('combobox');
    expect(screen.getByRole('option', { name: 'Todos mis sites' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '[1] POT' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '[2] SCAMP' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '[3] OTHER' })).not.toBeInTheDocument();
  });

  it('auto-selects the only site and hides selector', async () => {
    (sitesService.getAll as any).mockResolvedValue({
      data: [{ siteId: 1, code: 'POT' }],
    });

    act(() => {
      useAuthStore.setState({
        user: { ...baseUser, sites: [{ siteId: 1, code: 'POT' }] },
        selectedSiteId: null,
      });
    });

    renderSidebar();

    await waitFor(() => {
      expect(useAuthStore.getState().selectedSiteId).toBe(1);
    });

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('[1] POT')).toBeInTheDocument();
  });
});
