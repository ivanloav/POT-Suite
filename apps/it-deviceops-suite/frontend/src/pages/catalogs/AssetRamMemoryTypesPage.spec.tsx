import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetRamMemoryTypesPage from './AssetRamMemoryTypesPage';
import { useAuthStore } from '@/store/authStore';
import { assetRamMemoryTypeService } from '@/services/assetRamMemoryTypeService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetRamMemoryTypeService', () => ({
  assetRamMemoryTypeService: {
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

describe('AssetRamMemoryTypesPage', () => {
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

    (assetRamMemoryTypeService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads RAM memory types', async () => {
    renderWithQuery(<AssetRamMemoryTypesPage />);

    expect(screen.getByText('Tipos de Memoria RAM')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetRamMemoryTypeService.getAll).toHaveBeenCalled();
    });
  });
});
