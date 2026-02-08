import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssignmentsPage from './AssignmentsPage';
import { useAuthStore } from '@/store/authStore';
import { assignmentsService } from '@/services/assignmentsService';

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/services/assignmentsService', () => ({
  assignmentsService: {
    getAll: vi.fn(),
    importFromExcel: vi.fn(),
    downloadTemplate: vi.fn(),
    exportToExcel: vi.fn(),
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

describe('AssignmentsPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        selectedSiteId: 3,
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assignments.read'],
          sites: [],
        },
      });
    });

    (assignmentsService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads assignments', async () => {
    renderWithQuery(<AssignmentsPage />);

    expect(screen.getByText('Asignaciones')).toBeInTheDocument();

    await waitFor(() => {
      expect(assignmentsService.getAll).toHaveBeenCalledWith(3);
    });
  });
});
