import { act, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import Dashboard from './Dashboard';
import { useAuthStore } from '@/store/authStore';
import { assetsService } from '@/services/assetsService';

vi.mock('@/services/assetsService', () => ({
  assetsService: {
    getAll: vi.fn(),
  },
}));

const renderWithQuery = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('Dashboard', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({ selectedSiteId: 2 });
    });
    (assetsService.getAll as any).mockReset?.();
  });

  afterEach(() => {
    act(() => {
      useAuthStore.setState({ selectedSiteId: null });
    });
  });

  it('renders stats from assets data', async () => {
    (assetsService.getAll as any).mockResolvedValue({
      data: [
        { status: { code: 'in_stock' } },
        { status: { code: 'assigned' } },
        { status: { code: 'assigned' } },
        { status: { code: 'retired' } },
      ],
      pagination: { total: 4 },
    });

    renderWithQuery(<Dashboard />);

    await waitFor(() => {
      expect(assetsService.getAll).toHaveBeenCalledWith({ siteId: 2 });
    });

    const totalCard = screen.getByText('Total Activos').parentElement;
    await waitFor(() => {
      expect(within(totalCard!).getByText('4')).toBeInTheDocument();
    });

    const inStockCard = screen.getByText('En Stock').parentElement;
    await waitFor(() => {
      expect(within(inStockCard!).getByText('1')).toBeInTheDocument();
    });

    const assignedCard = screen.getByText('Asignados').parentElement;
    await waitFor(() => {
      expect(within(assignedCard!).getByText('2')).toBeInTheDocument();
    });

    const retiredCard = screen.getByText('Retirados').parentElement;
    await waitFor(() => {
      expect(within(retiredCard!).getByText('1')).toBeInTheDocument();
    });
  });
});
