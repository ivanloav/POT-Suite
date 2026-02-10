import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetsPage from './AssetsPage';
import { useAuthStore } from '@/store/authStore';
import { assetsService } from '@/services/assetsService';
import { catalogsService } from '@/services/catalogsService';
import { sitesService } from '@/services/sitesService';

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/services/assetsService', () => ({
  assetsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    downloadTemplate: vi.fn(),
    importFromExcel: vi.fn(),
    updateDuplicatesFromExcel: vi.fn(),
  },
}));

vi.mock('@/services/catalogsService', () => ({
  catalogsService: {
    getAssetTypes: vi.fn(),
    getSections: vi.fn(),
  },
}));

vi.mock('@/services/sitesService', () => ({
  sitesService: {
    getById: vi.fn(),
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

describe('AssetsPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        selectedSiteId: 2,
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assets.read'],
          sites: [],
        },
      });
    });

    (assetsService.getAll as any).mockResolvedValue({ data: [], pagination: { total: 0 } });
    (catalogsService.getAssetTypes as any).mockResolvedValue({ data: [] });
    (catalogsService.getSections as any).mockResolvedValue({ data: [] });
    (sitesService.getById as any).mockResolvedValue({ data: { siteId: 2, code: 'POT' } });
  });

  it('renders header and loads assets', async () => {
    renderWithQuery(<AssetsPage />);

    expect(screen.getByText('Activos')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetsService.getAll).toHaveBeenCalledWith({ siteId: 2 });
    });
  });
});
