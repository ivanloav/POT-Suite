import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import toast from 'react-hot-toast';
import AssetMaintenancePlanForm from './AssetMaintenancePlanForm';
import { useAuthStore } from '@/store/authStore';
import { assetsService } from '@/services/assetsService';
import { assetMaintenancePlansService } from '@/services/assetMaintenancePlansService';
import { assetMaintenanceTypesService } from '@/services/assetMaintenanceTypesService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetsService', () => ({
  assetsService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/assetMaintenancePlansService', () => ({
  assetMaintenancePlansService: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/services/assetMaintenanceTypesService', () => ({
  assetMaintenanceTypesService: {
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

describe('AssetMaintenancePlanForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    (assetsService.getAll as any).mockResolvedValue({
      data: [{ id: 10, assetTag: 'PRN-1', serial: 'SR-10' }],
    });

    (assetMaintenanceTypesService.getAll as any).mockResolvedValue({
      data: [{ code: 'printer_cleaning', name: 'Limpieza impresora' }],
    });

    (assetMaintenancePlansService.create as any).mockResolvedValue({ data: { id: 1 } });
    (assetMaintenancePlansService.getById as any).mockResolvedValue({
      data: {
        id: 42,
        siteId: 1,
        assetId: 10,
        title: 'Limpieza trimestral',
        maintenanceType: 'printer_cleaning',
        description: 'Chequeo general',
        frequencyDays: 90,
        nextDueDate: '2026-03-10',
        isActive: true,
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-02-02T10:00:00Z',
      },
    });
  });

  it('submits a new maintenance plan', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    renderWithQuery(
      <AssetMaintenancePlanForm mode="create" onSuccess={onSuccess} onCancel={() => {}} />
    );

    await screen.findByRole('option', { name: /PRN-1/i });

    await user.selectOptions(screen.getByLabelText(/Activo/i), '10');
    await user.type(screen.getByLabelText(/Título/i), 'Limpieza mensual');
    await user.selectOptions(screen.getByLabelText(/Tipo de mantenimiento/i), 'printer_cleaning');
    await user.clear(screen.getByLabelText(/Frecuencia/i));
    await user.type(screen.getByLabelText(/Frecuencia/i), '30');
    await user.type(screen.getByLabelText(/Próxima fecha/i), '2026-02-20');

    await user.click(screen.getByRole('button', { name: /Crear Plan/i }));

    await waitFor(() => {
      expect(assetMaintenancePlansService.create).toHaveBeenCalled();
    });
  });

  it('loads plan data in edit mode', async () => {
    renderWithQuery(
      <AssetMaintenancePlanForm
        mode="edit"
        planId={42}
        onSuccess={() => {}}
        onCancel={() => {}}
      />
    );

    const titleInput = await screen.findByLabelText(/Título/i);
    expect((titleInput as HTMLInputElement).value).toBe('Limpieza trimestral');

    await waitFor(() => {
      expect(assetMaintenancePlansService.getById).toHaveBeenCalledWith(42);
    });
  });

  it('calls onComplete with notes and incidents', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    renderWithQuery(
      <AssetMaintenancePlanForm
        mode="edit"
        planId={42}
        onSuccess={() => {}}
        onCancel={() => {}}
        onComplete={onComplete}
      />
    );

    await user.type(await screen.findByLabelText('Notas'), 'Todo ok');
    await user.type(screen.getByLabelText('Incidencias'), 'Sin incidencias');

    await user.click(screen.getByRole('button', { name: 'Marcar realizado' }));

    expect(onComplete).toHaveBeenCalledWith({
      notes: 'Todo ok',
      incidents: 'Sin incidencias',
    });
  });

  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <AssetMaintenancePlanForm mode="create" onSuccess={() => {}} onCancel={() => {}} />
    );

    await user.click(screen.getByRole('button', { name: /Crear Plan/i }));

    expect(await screen.findByText('El activo es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El título es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('La frecuencia es obligatoria')).toBeInTheDocument();
    expect(screen.getByText('La fecha es obligatoria')).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
    expect(assetMaintenancePlansService.create).not.toHaveBeenCalled();
  });
});
