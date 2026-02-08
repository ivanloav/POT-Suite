import { render, screen } from '@testing-library/react';
import { Plus } from 'lucide-react';
import { ActionButton } from './ActionButton';

describe('ActionButton', () => {
  it('renders children and variant styles', () => {
    render(<ActionButton variant="create">Crear</ActionButton>);
    const button = screen.getByRole('button', { name: 'Crear' });
    expect(button).toHaveClass('bg-green-50');
  });

  it('renders an icon when provided', () => {
    render(
      <ActionButton variant="primary" icon={Plus}>
        Nuevo
      </ActionButton>
    );
    const button = screen.getByRole('button', { name: 'Nuevo' });
    expect(button.querySelector('svg')).toBeTruthy();
  });

  it('shows loading text and disables button', () => {
    render(
      <ActionButton variant="save" loading loadingText="Guardando">
        Guardar
      </ActionButton>
    );

    const button = screen.getByRole('button', { name: 'Guardando' });
    expect(button).toBeDisabled();
  });
});
