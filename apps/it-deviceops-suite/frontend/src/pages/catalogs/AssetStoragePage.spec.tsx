import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetStoragePage from './AssetStoragePage';
import { useAuthStore } from '@/store/authStore';
import { AssetStorageService } from '@/services/assetStorageService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetStorageService', () => ({
  AssetStorageService: {
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

describe('AssetStoragePage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assetStorage.read'],
          sites: [],
        },
      });
    });

    (AssetStorageService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads storage catalog', async () => {
    renderWithQuery(<AssetStoragePage />);

    expect(await screen.findByText('Catálogo de Almacenamiento')).toBeInTheDocument();

    await waitFor(() => {
      expect(AssetStorageService.getAll).toHaveBeenCalled();
    });
  });
});
