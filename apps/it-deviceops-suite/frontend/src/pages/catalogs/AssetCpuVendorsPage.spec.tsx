import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetCpuVendorsPage from './AssetCpuVendorsPage';
import { useAuthStore } from '@/store/authStore';
import { assetCpuVendorService } from '@/services/assetCpuVendorService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetCpuVendorService', () => ({
  assetCpuVendorService: {
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

describe('AssetCpuVendorsPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assetCPU.read'],
          sites: [],
        },
      });
    });

    (assetCpuVendorService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads vendors', async () => {
    renderWithQuery(<AssetCpuVendorsPage />);

    expect(screen.getByText('Vendedores de CPU')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetCpuVendorService.getAll).toHaveBeenCalled();
    });
  });
});
