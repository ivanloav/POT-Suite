import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetMaintenanceTypesPage from './AssetMaintenanceTypesPage';
import { useAuthStore } from '@/store/authStore';
import { assetMaintenanceTypesService } from '@/services/assetMaintenanceTypesService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetMaintenanceTypesService', () => ({
  assetMaintenanceTypesService: {
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

describe('AssetMaintenanceTypesPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['maintenanceTypes.read'],
          sites: [],
        },
      });
    });

    (assetMaintenanceTypesService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads maintenance types', async () => {
    renderWithQuery(<AssetMaintenanceTypesPage />);

    expect(screen.getByText('Tipos de Mantenimiento')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetMaintenanceTypesService.getAll).toHaveBeenCalled();
    });
  });
});
