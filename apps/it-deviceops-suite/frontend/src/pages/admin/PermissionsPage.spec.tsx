import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import PermissionsPage from './PermissionsPage';
import { useAuthStore } from '@/store/authStore';
import permissionsAdminService from '@/services/permissionsAdminService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/permissionsAdminService', () => ({
  default: {
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

describe('PermissionsPage', () => {
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

    (permissionsAdminService as any).getAll.mockResolvedValue([]);
  });

  it('renders header and loads permissions', async () => {
    renderWithQuery(<PermissionsPage />);

    expect(screen.getByText('Permisos')).toBeInTheDocument();

    await waitFor(() => {
      expect((permissionsAdminService as any).getAll).toHaveBeenCalled();
    });
  });
});
