import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DuplicatesModal from './DuplicatesModal';

describe('DuplicatesModal', () => {
  it('returns null when closed or empty', () => {
    const { rerender } = render(
      <DuplicatesModal
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        duplicates={[]}
        columns={[]}
      />
    );

    expect(screen.queryByText(/Duplicados/)).not.toBeInTheDocument();

    rerender(
      <DuplicatesModal
        isOpen
        onClose={() => {}}
        onConfirm={() => {}}
        duplicates={[]}
        columns={[]}
      />
    );
    expect(screen.queryByText(/Duplicados/)).not.toBeInTheDocument();
  });

  it('renders duplicates and triggers actions', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DuplicatesModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        duplicates={[{ assetTag: 'A-1', serial: 'S-1', idExistente: 10 }]}
        columns={[
          { key: 'assetTag', label: 'Etiqueta' },
          { key: 'serial', label: 'Serial' },
          { key: 'idExistente', label: 'ID' },
        ]}
      />
    );

    expect(screen.getByText(/Se encontraron 1 registro/)).toBeInTheDocument();
    expect(screen.getByText(/Etiqueta: A-1/)).toBeInTheDocument();
    expect(screen.queryByText(/ID: 10/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Actualizar Todos' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
