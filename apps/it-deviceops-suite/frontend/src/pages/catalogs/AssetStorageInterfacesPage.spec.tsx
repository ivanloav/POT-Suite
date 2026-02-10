import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetStorageInterfacesPage from './AssetStorageInterfacesPage';
import { useAuthStore } from '@/store/authStore';
import { assetStorageInterfaceService } from '@/services/assetStorageInterfaceService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetStorageInterfaceService', () => ({
  assetStorageInterfaceService: {
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

describe('AssetStorageInterfacesPage', () => {
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

    (assetStorageInterfaceService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads interfaces', async () => {
    renderWithQuery(<AssetStorageInterfacesPage />);

    expect(screen.getByText('Interfaces de Disco')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetStorageInterfaceService.getAll).toHaveBeenCalled();
    });
  });
});
