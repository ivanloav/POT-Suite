import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import SiteForm from './SiteForm';
import { useAuthStore } from '@/store/authStore';
import { sitesService } from '@/services/sitesAdminService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/sitesAdminService', () => ({
  sitesService: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
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

describe('SiteForm', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['system.admin'],
          sites: [],
        },
      });
    });

    (sitesService.create as any).mockResolvedValue({ data: { siteId: 1 } });
  });

  it('submits create form', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    renderWithQuery(<SiteForm mode="create" onSuccess={onSuccess} onCancel={() => {}} />);

    await user.type(screen.getByLabelText(/Código/i), 'POT');
    await user.type(screen.getByLabelText(/Nombre/i), 'Parcel on time');

    await user.click(screen.getByRole('button', { name: 'Crear Site' }));

    await waitFor(() => {
      expect(sitesService.create).toHaveBeenCalledWith(
        {
          code: 'POT',
          name: 'Parcel on time',
          isActive: true,
        },
        expect.anything()
      );
    });
  });
});
