import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { useInactivityLogout } from './useInactivityLogout';

const TestComponent = ({ onLogout }: { onLogout: () => void }) => {
  useInactivityLogout(onLogout);
  return null;
};

describe('useInactivityLogout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onLogout after inactivity timeout', () => {
    vi.useFakeTimers();
    const onLogout = vi.fn();

    render(<TestComponent onLogout={onLogout} />);

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('resets timer on activity', () => {
    vi.useFakeTimers();
    const onLogout = vi.fn();

    render(<TestComponent onLogout={onLogout} />);

    vi.advanceTimersByTime(30 * 60 * 1000);
    document.dispatchEvent(new Event('click'));
    vi.advanceTimersByTime(30 * 60 * 1000);

    expect(onLogout).not.toHaveBeenCalled();
  });
});
