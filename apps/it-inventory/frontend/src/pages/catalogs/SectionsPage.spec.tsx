import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import SectionsPage from './SectionsPage';
import { useAuthStore } from '@/store/authStore';
import { sectionService } from '@/services/sectionService';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/sectionService', () => ({
  sectionService: {
    getAll: vi.fn(),
    exportToExcel: vi.fn(),
    downloadTemplate: vi.fn(),
    importFromExcel: vi.fn(),
    updateDuplicatesFromExcel: vi.fn(),
    getNextSortOrder: vi.fn(),
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

describe('SectionsPage', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          userName: 'Ivan',
          email: 'ivan@example.com',
          roles: [],
          permissions: ['sections.read'],
          sites: [],
        },
        selectedSiteId: 1,
      });
    });

    (sectionService.getAll as any).mockResolvedValue({ data: [] });
  });

  it('renders header and loads sections', async () => {
    renderWithQuery(<SectionsPage />);

    expect(screen.getByText('Secciones')).toBeInTheDocument();

    await waitFor(() => {
      expect(sectionService.getAll).toHaveBeenCalled();
    });
  });
});
