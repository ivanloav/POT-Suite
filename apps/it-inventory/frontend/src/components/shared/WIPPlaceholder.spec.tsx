import { render, screen } from '@testing-library/react';
import WIPPlaceholder from './WIPPlaceholder';

describe('WIPPlaceholder', () => {
  it('renders placeholder message', () => {
    render(<WIPPlaceholder />);

    expect(screen.getByText(/Página en desarrollo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Esta sección está en construcción/i)
    ).toBeInTheDocument();
  });
});
