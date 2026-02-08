import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
  it('renders content when open and locks body scroll', () => {
    const { unmount } = render(
      <Modal isOpen onClose={() => {}} title="Test">
        <div>Contenido</div>
      </Modal>
    );

    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        <div>Contenido</div>
      </Modal>
    );

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test">
        <div>Contenido</div>
      </Modal>
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
