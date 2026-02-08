import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import EmployeesPage from './EmployeesPage';
import { useAuthStore } from '@/store/authStore';
import { employeesService } from '@/services/employeesService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/services/employeesService', () => ({
  employeesService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    downloadTemplate: vi.fn(),
    importFromExcel: vi.fn(),
    updateDuplicatesFromExcel: vi.fn(),
  },
}));

vi.mock('@/services/sitesService', () => ({
  sitesService: {
    getById: vi.fn(),
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

describe('EmployeesPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        selectedSiteId: 1,
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['employees.read'],
          sites: [],
        },
      });
    });

    (employeesService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads employees', async () => {
    renderWithQuery(<EmployeesPage />);

    expect(screen.getByText('Empleados')).toBeInTheDocument();

    await waitFor(() => {
      expect(employeesService.getAll).toHaveBeenCalledWith({ isActive: undefined, siteId: 1 });
    });
  });
});
