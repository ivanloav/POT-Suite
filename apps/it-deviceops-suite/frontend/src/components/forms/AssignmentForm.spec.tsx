import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AssignmentForm from './AssignmentForm';
import { useAuthStore } from '@/store/authStore';
import { assetsService } from '@/services/assetsService';
import { employeesService } from '@/services/employeesService';

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

vi.mock('@/services/employeesService', () => ({
  employeesService: {
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

describe('AssignmentForm', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        selectedSiteId: 1,
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['assignments.read', 'assignments.create'],
          sites: [],
        },
      });
    });

    (assetsService.getAll as any).mockResolvedValue({
      data: [
        {
          id: 10,
          assetTag: 'A-1',
          siteId: 1,
          status: { code: 'in_stock' },
          model: { brand: { name: 'Dell' }, name: 'XPS' },
        },
      ],
    });
    (employeesService.getAll as any).mockResolvedValue({
      data: [{ id: 3, siteId: 1, firstName: 'Ana', lastName: 'Lopez' }],
    });
  });

  it('enables employee select after choosing asset', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    renderWithQuery(
      <AssignmentForm mode="create" onSuccess={() => {}} onCancel={onCancel} />
    );

    const employeeSelect = screen.getByLabelText(/Empleado/i) as HTMLSelectElement;
    expect(employeeSelect).toBeDisabled();

    await screen.findByRole('option', { name: /A-1/i });

    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Activo/i), '10');
    });

    expect(employeeSelect).not.toBeDisabled();
  });

  it('handles cancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    renderWithQuery(
      <AssignmentForm mode="create" onSuccess={() => {}} onCancel={onCancel} />
    );

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
