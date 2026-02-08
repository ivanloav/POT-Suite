import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import SitesPage from './SitesPage';
import { useAuthStore } from '@/store/authStore';
import { sitesService } from '@/services/sitesAdminService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/sitesAdminService', () => ({
  sitesService: {
    getAll: vi.fn(),
    exportToExcel: vi.fn(),
    downloadTemplate: vi.fn(),
    importFromExcel: vi.fn(),
  },
}));

const renderWithQuery = (ui: React.ReactElement) => {
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

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('SitesPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['system.admin'],
          sites: [],
        },
      });
    });

    (sitesService as any).getAll.mockResolvedValue({ data: [] });
  });

  it('renders header and loads sites', async () => {
    renderWithQuery(<SitesPage />);

    expect(screen.getByText('Gestión de Sedes')).toBeInTheDocument();

    await waitFor(() => {
      expect((sitesService as any).getAll).toHaveBeenCalled();
    });
  });
});
