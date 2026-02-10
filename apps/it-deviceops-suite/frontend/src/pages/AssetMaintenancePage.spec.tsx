import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetMaintenancePage from './AssetMaintenancePage';
import { useAuthStore } from '@/store/authStore';
import { assetMaintenancePlansService } from '@/services/assetMaintenancePlansService';
import { assetMaintenanceRecordsService } from '@/services/assetMaintenanceRecordsService';
import { sitesService } from '@/services/sitesService';
import { assetMaintenanceTypeService } from '@/services/assetMaintenanceTypeService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetMaintenancePlansService', () => ({
  assetMaintenancePlansService: {
    getAll: vi.fn(),
    complete: vi.fn(),
  },
}));

vi.mock('@/services/assetMaintenanceRecordsService', () => ({
  assetMaintenanceRecordsService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/sitesService', () => ({
  sitesService: {
    getById: vi.fn(),
  },
}));

vi.mock('@/services/assetMaintenanceTypeService', () => ({
  assetMaintenanceTypeService: {
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

describe('AssetMaintenancePage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        selectedSiteId: 1,
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

    (assetMaintenancePlansService.getAll as any).mockResolvedValue({ data: [] });
    (assetMaintenanceRecordsService.getAll as any).mockResolvedValue({ data: [] });
    (sitesService.getById as any).mockResolvedValue({ data: { code: 'POT' } });
    (assetMaintenanceTypeService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads maintenance data', async () => {
    renderWithQuery(<AssetMaintenancePage />);

    expect(screen.getByText('Mantenimientos')).toBeInTheDocument();

    await waitFor(() => {
      expect(assetMaintenancePlansService.getAll).toHaveBeenCalled();
      expect(assetMaintenanceRecordsService.getAll).toHaveBeenCalled();
      expect(sitesService.getById).toHaveBeenCalled();
    });
  });

  it('switches to timeline view', async () => {
    const user = userEvent.setup();

    renderWithQuery(<AssetMaintenancePage />);

    await user.click(screen.getByRole('button', { name: 'Timeline' }));

    expect(await screen.findByText('No hay mantenimientos para mostrar')).toBeInTheDocument();
  });

  it('renders dashboard metrics from plans and records', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const inThreeDays = new Date(today);
    inThreeDays.setDate(today.getDate() + 3);

    const toDateString = (date: Date) => date.toISOString().split('T')[0];

    (assetMaintenancePlansService.getAll as any).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          siteId: 1,
          assetId: 10,
          title: 'Plan vencido',
          frequencyDays: 30,
          nextDueDate: toDateString(yesterday),
          isActive: true,
          createdAt: today.toISOString(),
        },
        {
          id: 2,
          siteId: 1,
          assetId: 11,
          title: 'Plan próximo',
          frequencyDays: 30,
          nextDueDate: toDateString(inThreeDays),
          isActive: true,
          createdAt: today.toISOString(),
        },
      ],
    });

    (assetMaintenanceRecordsService.getAll as any).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          siteId: 1,
          assetId: 10,
          planId: 1,
          performedAt: today.toISOString(),
          status: 'completed',
          createdAt: today.toISOString(),
        },
      ],
    });

    renderWithQuery(<AssetMaintenancePage />);

    const overdueCard = await screen.findByText('Vencidos');
    expect(within(overdueCard.parentElement!).getByText('1')).toBeInTheDocument();

    const upcomingCard = screen.getByText('Próximos 7 días');
    expect(within(upcomingCard.parentElement!).getByText('1')).toBeInTheDocument();

    const completedCard = screen.getByText('Completados este mes');
    expect(within(completedCard.parentElement!).getByText('1')).toBeInTheDocument();

    const complianceCard = screen.getByText('Compliance');
    expect(within(complianceCard.parentElement!).getByText('50')).toBeInTheDocument();
  });
});
