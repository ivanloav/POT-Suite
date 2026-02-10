import '@testing-library/jest-dom/vitest';

const originalError = console.error;
console.error = (...args: unknown[]) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (first.includes('not wrapped in act')) {
    return;
  }
  originalError(...args);
};

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (first.includes('React Router Future Flag Warning')) {
    return;
  }
  originalWarn(...args);
};

if (!window.matchMedia) {
  const noop = () => {};
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    }),
  });
}
