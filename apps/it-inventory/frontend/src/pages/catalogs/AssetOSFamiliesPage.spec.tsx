import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import OSFamiliesPage from './AssetOSFamiliesPage';
import { useAuthStore } from '@/store/authStore';
import { AssetOsFamiliesService } from '@/services/assetOsFamiliesService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetOsFamiliesService', () => ({
  AssetOsFamiliesService: {
    getAll: vi.fn(),
    exportFamiliesToExcel: vi.fn(),
    downloadFamiliesTemplate: vi.fn(),
    importFamiliesFromExcel: vi.fn(),
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

describe('AssetOSFamiliesPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assetOsFamilies.read'],
          sites: [],
        },
      });
    });

    (AssetOsFamiliesService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads families', async () => {
    renderWithQuery(<OSFamiliesPage />);

    expect(screen.getByText('Familias de Sistemas Operativos')).toBeInTheDocument();

    await waitFor(() => {
      expect(AssetOsFamiliesService.getAll).toHaveBeenCalled();
    });
  });
});
