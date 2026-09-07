import type { JSX } from 'react';
import { MoonIcon, SunIcon } from './Icons';
import { THEMES, type Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  readonly theme: Theme;
  readonly onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps): JSX.Element => {
  const next = theme === THEMES.dark ? 'light' : 'dark';
  return (
    <button type="button" className="theme-toggle mono" onClick={onToggle} aria-label={`Switch to ${next} theme`}>
      {theme === THEMES.dark ? <SunIcon /> : <MoonIcon />}
      {next}
    </button>
  );
};
