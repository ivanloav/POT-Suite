import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetStorageDriveTypesPage from './AssetStorageDriveTypesPage';
import { useAuthStore } from '@/store/authStore';
import { assetStorageDriveTypeService } from '@/services/assetStorageDriveTypeService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetStorageDriveTypeService', () => ({
  assetStorageDriveTypeService: {
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

describe('AssetStorageDriveTypesPage', () => {
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

    (assetStorageDriveTypeService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads drive types', async () => {
    renderWithQuery(<AssetStorageDriveTypesPage />);

    expect(screen.getByText('Tipos de Disco')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetStorageDriveTypeService.getAll).toHaveBeenCalled();
    });
  });
});
