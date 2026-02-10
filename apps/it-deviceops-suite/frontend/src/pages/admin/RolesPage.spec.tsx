import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import RolesPage from './RolesPage';
import { useAuthStore } from '@/store/authStore';
import rolesAdminService from '@/services/rolesAdminService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/rolesAdminService', () => ({
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

describe('RolesPage', () => {
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

    (rolesAdminService as any).getAll.mockResolvedValue([]);
  });

  it('renders header and loads roles', async () => {
    renderWithQuery(<RolesPage />);

    expect(screen.getByText('Roles')).toBeInTheDocument();

    await waitFor(() => {
      expect((rolesAdminService as any).getAll).toHaveBeenCalled();
    });
  });
});
