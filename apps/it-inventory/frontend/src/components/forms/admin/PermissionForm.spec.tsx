import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import PermissionForm from './PermissionForm';
import { useAuthStore } from '@/store/authStore';
import permissionsAdminService from '@/services/permissionsAdminService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/permissionsAdminService', () => ({
  default: {
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

describe('PermissionForm', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['users.create'],
          sites: [],
        },
      });
    });

    (permissionsAdminService.create as any).mockResolvedValue({ id: 1 });
  });

  it('creates permission', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <PermissionForm mode="create" onSuccess={() => {}} onCancel={() => {}} />
    );

    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'assets.read');
    await user.type(textboxes[1], 'Ver activos');

    await user.click(screen.getByRole('button', { name: 'Crear Permiso' }));

    await waitFor(() => {
      expect(permissionsAdminService.create).toHaveBeenCalled();
    });
  });
});
