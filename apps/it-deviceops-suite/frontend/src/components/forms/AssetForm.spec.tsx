import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetForm from './AssetForm';
import { useAuthStore } from '@/store/authStore';
import { assetsService } from '@/services/assetsService';
import { catalogsService } from '@/services/catalogsService';
import { AssetOsVersionsService } from '@/services/assetOsVersionsService';
import { employeesService } from '@/services/employeesService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetsService', () => ({
  assetsService: {
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/services/catalogsService', () => ({
  catalogsService: {
    getAssetTypes: vi.fn(),
    getSections: vi.fn(),
    getAssetModels: vi.fn(),
    getCpus: vi.fn(),
    getRamOptions: vi.fn(),
    getStorageOptions: vi.fn(),
    getAssetStatuses: vi.fn(),
  },
}));

vi.mock('@/services/assetOsVersionsService', () => ({
  AssetOsVersionsService: {
    getOsVersions: vi.fn(),
  },
}));

vi.mock('@/services/employeesService', () => ({
  employeesService: {
    getAll: vi.fn(),
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

describe('AssetForm', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        selectedSiteId: 1,
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assets.read', 'assets.create'],
          sites: [],
        },
      });
    });

    (catalogsService.getAssetTypes as any).mockResolvedValue({ data: [] });
    (catalogsService.getSections as any).mockResolvedValue({ data: [] });
    (catalogsService.getAssetModels as any).mockResolvedValue({ data: [] });
    (catalogsService.getCpus as any).mockResolvedValue({ data: [] });
    (catalogsService.getRamOptions as any).mockResolvedValue({ data: [] });
    (catalogsService.getStorageOptions as any).mockResolvedValue({ data: [] });
    (catalogsService.getAssetStatuses as any).mockResolvedValue({ data: [] });
    (AssetOsVersionsService.getOsVersions as any).mockResolvedValue({ data: [] });
    (employeesService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders create actions and handles cancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    renderWithQuery(
      <AssetForm mode="create" onSuccess={() => {}} onCancel={onCancel} />
    );

    expect(screen.getByRole('button', { name: 'Crear Activo' })).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
