import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import EmployeeForm from './EmployeeForm';
import { useAuthStore } from '@/store/authStore';
import { employeesService } from '@/services/employeesService';
import { sitesService } from '@/services/sitesService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/employeesService', () => ({
  employeesService: {
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/services/sitesService', () => ({
  sitesService: {
    getMySites: vi.fn(),
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

describe('EmployeeForm', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['employees.read', 'employees.create'],
          sites: [],
        },
      });
    });

    (sitesService.getMySites as any).mockResolvedValue({
      data: [{ siteId: 1, code: 'POT', name: 'Parcel' }],
    });
  });

  it('renders create actions and handles cancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    renderWithQuery(
      <EmployeeForm mode="create" onSuccess={() => {}} onCancel={onCancel} />
    );

    expect(screen.getByRole('button', { name: 'Crear Empleado' })).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
