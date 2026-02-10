import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetBrandsPage from './AssetBrandsPage';
import { useAuthStore } from '@/store/authStore';
import { assetBrandsService } from '@/services/assetBrandsService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetBrandsService', () => ({
  assetBrandsService: {
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

describe('AssetBrandsPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assetBrands.read'],
          sites: [],
        },
      });
    });

    (assetBrandsService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads brands', async () => {
    renderWithQuery(<AssetBrandsPage />);

    expect(await screen.findByText('Marcas de Activos')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetBrandsService.getAll).toHaveBeenCalled();
    });
  });
});
