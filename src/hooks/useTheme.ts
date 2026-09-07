import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export const THEMES = { dark: 'dark', light: 'light' } as const;
export type Theme = (typeof THEMES)[keyof typeof THEMES];

const STORAGE_KEY = 'theme';

const readStoredTheme = (): Theme | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === THEMES.light || value === THEMES.dark ? value : null;
  } catch {
    return null;
  }
};

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? THEMES.light : THEMES.dark;

export const useTheme = (): { theme: Theme; toggleTheme: () => void } => {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable (private mode); theme still applies for this page load.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = (current: Theme): Theme => (current === THEMES.dark ? THEMES.light : THEMES.dark);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Circular wipe between themes where the View Transitions API exists; instant elsewhere.
    if (!reduced && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
      return;
    }
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
};
