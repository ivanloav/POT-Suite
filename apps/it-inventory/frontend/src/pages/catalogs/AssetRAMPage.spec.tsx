import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetRAMPage from './AssetRAMPage';
import { useAuthStore } from '@/store/authStore';
import { AssetRamService } from '@/services/assetRamService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetRamService', () => ({
  AssetRamService: {
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

describe('AssetRAMPage', () => {
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

    (AssetRamService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads RAM catalog', async () => {
    renderWithQuery(<AssetRAMPage />);

    expect(await screen.findByText('Catálogo de RAM')).toBeInTheDocument();

    await waitFor(() => {
      expect(AssetRamService.getAll).toHaveBeenCalled();
    });
  });
});
