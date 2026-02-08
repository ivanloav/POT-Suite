import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import UsersPage from './UsersPage';
import { useAuthStore } from '@/store/authStore';
import usersAdminService from '@/services/usersAdminService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/usersAdminService', () => ({
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

describe('UsersPage', () => {
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

    (usersAdminService as any).getAll.mockResolvedValue([]);
  });

  it('renders header and loads users', async () => {
    renderWithQuery(<UsersPage />);

    expect(screen.getByText('Usuarios')).toBeInTheDocument();

    await waitFor(() => {
      expect((usersAdminService as any).getAll).toHaveBeenCalled();
    });
  });
});
