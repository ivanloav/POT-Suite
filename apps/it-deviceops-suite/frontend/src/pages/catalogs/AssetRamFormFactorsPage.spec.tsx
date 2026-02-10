import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetRamFormFactorsPage from './AssetRamFormFactorsPage';
import { useAuthStore } from '@/store/authStore';
import { assetRamFormFactorService } from '@/services/assetRamFormFactorService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetRamFormFactorService', () => ({
  assetRamFormFactorService: {
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

describe('AssetRamFormFactorsPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assetRAM.read'],
          sites: [],
        },
      });
    });

    (assetRamFormFactorService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads RAM form factors', async () => {
    renderWithQuery(<AssetRamFormFactorsPage />);

    expect(screen.getByText('Form Factors RAM')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetRamFormFactorService.getAll).toHaveBeenCalled();
    });
  });
});
