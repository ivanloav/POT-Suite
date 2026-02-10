import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetStatusesPage from './AssetStatusesPage';
import { useAuthStore } from '@/store/authStore';
import { assetStatusService } from '@/services/assetStatusService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetStatusService', () => ({
  assetStatusService: {
    getAll: vi.fn(),
    exportToExcel: vi.fn(),
    downloadTemplate: vi.fn(),
    importFromExcel: vi.fn(),
    updateDuplicatesFromExcel: vi.fn(),
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

describe('AssetStatusesPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assetTypes.read'],
          sites: [],
        },
      });
    });

    (assetStatusService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads statuses', async () => {
    renderWithQuery(<AssetStatusesPage />);

    expect(screen.getByText('Estados de activos')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetStatusService.getAll).toHaveBeenCalled();
    });
  });
});
