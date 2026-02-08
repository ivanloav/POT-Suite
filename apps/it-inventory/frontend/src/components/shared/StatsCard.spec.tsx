import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';

const DummyIcon = () => <svg data-testid="dummy-icon" />;

describe('StatsCard', () => {
  it('renders title, value, and subtitle', () => {
    render(
      <StatsCard
        title="Pendientes"
        value={12}
        color="blue"
        icon={DummyIcon as any}
        subtitle="Esta semana"
      />
    );

    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Esta semana')).toBeInTheDocument();
    expect(screen.getByTestId('dummy-icon')).toBeInTheDocument();
  });

  it('omits subtitle when not provided', () => {
    render(
      <StatsCard
        title="Completados"
        value={3}
        color="green"
        icon={DummyIcon as any}
      />
    );

    expect(screen.getByText('Completados')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('Esta semana')).not.toBeInTheDocument();
  });
});
