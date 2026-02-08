import { useThemeStore } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('setTheme updates theme, storage, and document class', () => {
    useThemeStore.getState().setTheme('dark');

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggleTheme flips theme and updates document class', () => {
    useThemeStore.setState({ theme: 'dark' });
    document.documentElement.classList.add('dark');

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
