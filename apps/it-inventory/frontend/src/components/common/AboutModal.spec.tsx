import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AboutModal from './AboutModal';

vi.mock('../../../package.json', () => ({ default: { version: '0.0.0-test' } }), { virtual: true });

describe('AboutModal', () => {
  it('renders app info when open', () => {
    render(<AboutModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Acerca de')).toBeInTheDocument();
    expect(screen.getByText('IT Inventory')).toBeInTheDocument();
    expect(screen.getByText(/Versión/i)).toBeInTheDocument();
  });
});
