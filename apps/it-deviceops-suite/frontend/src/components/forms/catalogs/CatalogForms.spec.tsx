import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssetMaintenanceTypeForm from './AssetMaintenanceTypeForm';
import AssetCpuVendorForm from './AssetCpuVendorForm';
import AssetTypeForm from './AssetTypeForm';
import { useAuthStore } from '@/store/authStore';
import { assetMaintenanceTypesService } from '@/services/assetMaintenanceTypesService';
import { assetCpuVendorService } from '@/services/assetCpuVendorService';
import { assetTypeService } from '@/services/assetTypeService';
import { AssetOsFamiliesService } from '@/services/assetOsFamiliesService';
import { typeOsCompatibilityService } from '@/services/typeOsCompatibilityService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/assetMaintenanceTypesService', () => ({
  assetMaintenanceTypesService: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/services/assetCpuVendorService', () => ({
  assetCpuVendorService: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/services/assetTypeService', () => ({
  assetTypeService: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/services/assetOsFamiliesService', () => ({
  AssetOsFamiliesService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/typeOsCompatibilityService', () => ({
  typeOsCompatibilityService: {
    getByType: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
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

describe('CatalogForms', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['system.admin', 'catalogs.create'],
          sites: [],
        },
      });
    });

    (assetMaintenanceTypesService.create as any).mockResolvedValue({ data: { id: 1 } });
    (assetCpuVendorService.create as any).mockResolvedValue({ data: { id: 1 } });
    (assetTypeService.create as any).mockResolvedValue({ data: { id: 1 } });
    (AssetOsFamiliesService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('creates a maintenance type', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <AssetMaintenanceTypeForm mode="create" onSuccess={() => {}} onCancel={() => {}} />
    );

    await user.type(screen.getByPlaceholderText('printer_cleaning'), 'printer_cleaning');

    const textboxes = screen.getAllByRole('textbox');
    const nameInput = textboxes.find((input) => !(input as HTMLInputElement).placeholder);
    expect(nameInput).toBeTruthy();
    await user.type(nameInput as HTMLElement, 'Limpieza impresora');

    await user.click(screen.getByRole('button', { name: 'Crear Tipo' }));

    await waitFor(() => {
      expect(assetMaintenanceTypesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'printer_cleaning',
          name: 'Limpieza impresora',
          isActive: true,
        }),
        expect.anything()
      );
    });
  });

  it('creates a CPU vendor', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <AssetCpuVendorForm mode="create" onSuccess={() => {}} onCancel={() => {}} />
    );

    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'intel');
    await user.type(textboxes[1], 'Intel');

    await user.click(screen.getByRole('button', { name: 'Crear Vendedor' }));

    await waitFor(() => {
      expect(assetCpuVendorService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'intel',
          name: 'Intel',
          isActive: true,
        }),
        expect.anything()
      );
    });
  });

  it('creates an asset type', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <AssetTypeForm mode="create" onSuccess={() => {}} onCancel={() => {}} />
    );

    await user.type(screen.getAllByRole('textbox')[0], 'PC portátil');

    await user.click(screen.getByRole('button', { name: 'Crear Tipo' }));

    await waitFor(() => {
      expect(assetTypeService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'PC portátil',
          isActive: true,
        }),
        expect.anything()
      );
    });
  });
});
