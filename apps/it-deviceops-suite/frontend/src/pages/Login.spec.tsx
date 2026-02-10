import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Login from './Login';

describe('Login', () => {
  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login />
      </MemoryRouter>
    );

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    });

    expect(await screen.findByText('El email es requerido')).toBeInTheDocument();
    expect(await screen.findByText('La contraseña es requerida')).toBeInTheDocument();
  });
});
