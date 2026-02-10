import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import OSPage from './AssetOSVersionsPage';
import { useAuthStore } from '@/store/authStore';
import { AssetOsVersionsService } from '@/services/assetOsVersionsService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetOsVersionsService', () => ({
  AssetOsVersionsService: {
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

describe('AssetOSVersionsPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['osVersions.read'],
          sites: [],
        },
        selectedSiteId: 1,
      });
    });

    (AssetOsVersionsService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads OS versions', async () => {
    renderWithQuery(<OSPage />);

    expect(screen.getByText('Versiones de sistemas operativos')).toBeInTheDocument();

    await waitFor(() => {
      expect(AssetOsVersionsService.getAll).toHaveBeenCalled();
    });
  });
});
