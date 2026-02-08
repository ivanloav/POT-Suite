import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import DashboardLayout from './DashboardLayout';

vi.mock('./Navbar', () => ({
  default: () => <div>NavbarMock</div>,
}));

vi.mock('./Sidebar', () => ({
  default: () => <div>SidebarMock</div>,
}));

describe('DashboardLayout', () => {
  it('renders navbar, sidebar, and outlet content', () => {
    render(
      <MemoryRouter
        initialEntries={['/dashboard']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route path="dashboard" element={<div>OutletContent</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('NavbarMock')).toBeInTheDocument();
    expect(screen.getByText('SidebarMock')).toBeInTheDocument();
    expect(screen.getByText('OutletContent')).toBeInTheDocument();
  });
});
