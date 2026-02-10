import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import UserForm from './UserForm';
import { useAuthStore } from '@/store/authStore';
import usersAdminService from '@/services/usersAdminService';
import rolesAdminService from '@/services/rolesAdminService';
import { sitesService } from '@/services/sitesService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/usersAdminService', () => ({
  default: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/services/rolesAdminService', () => ({
  default: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/sitesService', () => ({
  sitesService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/authService', () => ({
  authService: {
    refreshSession: vi.fn(),
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

describe('UserForm', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['system.admin', 'users.create'],
          sites: [{ siteId: 1, code: 'POT', name: 'Parcel' }],
        },
      });
    });

    (sitesService.getAll as any).mockResolvedValue({
      data: [{ siteId: 1, code: 'POT', name: 'Parcel' }],
    });
    (rolesAdminService.getAll as any).mockResolvedValue([{ id: 1, name: 'Admin' }]);
    (usersAdminService.create as any).mockResolvedValue({ id: 2 });
  });

  it('submits create form with selected sites and roles', async () => {
    const user = userEvent.setup();

    const { container } = renderWithQuery(
      <UserForm mode="create" onSuccess={() => {}} onCancel={() => {}} />
    );

    const userNameInput = container.querySelector('input[type="text"]');
    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    expect(userNameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();

    await user.type(userNameInput as HTMLInputElement, 'Nuevo Usuario');
    await user.type(emailInput as HTMLInputElement, 'nuevo@example.com');
    await user.type(passwordInput as HTMLInputElement, 'Aa1!aaaa');

    await screen.findByText('POT - Parcel');
    await screen.findByText('Admin');

    const listboxes = await screen.findAllByRole('listbox');
    await user.selectOptions(listboxes[0], '1');
    await user.selectOptions(listboxes[1], '1');

    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    await waitFor(() => {
      expect(usersAdminService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: 'Nuevo Usuario',
          email: 'nuevo@example.com',
          password: 'Aa1!aaaa',
          language: 'es',
          isActive: true,
          siteIds: [1],
          roleIds: [1],
        }),
        expect.anything()
      );
    });
  });
});
