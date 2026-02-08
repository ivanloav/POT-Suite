import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import RoleForm from './RoleForm';
import { useAuthStore } from '@/store/authStore';
import rolesAdminService from '@/services/rolesAdminService';
import permissionsAdminService from '@/services/permissionsAdminService';
import { rolePermissionsService } from '@/services/rolePermissionsService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/rolesAdminService', () => ({
  default: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/services/permissionsAdminService', () => ({
  default: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/rolePermissionsService', () => ({
  rolePermissionsService: {
    getByRole: vi.fn(),
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

describe('RoleForm', () => {
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

    (permissionsAdminService.getAll as any).mockResolvedValue([
      { id: 1, name: 'Permiso', code: 'permiso.leer', isActive: true },
    ]);
    (rolesAdminService.create as any).mockResolvedValue({ id: 1 });
    (rolePermissionsService.getByRole as any).mockResolvedValue({ data: [] });
  });

  it('creates role', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <RoleForm mode="create" onSuccess={() => {}} onCancel={() => {}} />
    );

    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'admin');
    await user.type(textboxes[1], 'Administrador');

    const submitButton = await screen.findByRole('button', { name: 'Crear Rol' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(rolesAdminService.create).toHaveBeenCalled();
    });
  });
});
