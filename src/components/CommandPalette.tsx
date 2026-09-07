import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { NAV_SECTIONS, PROFILE } from '../data/profile';
import { THEMES, type Theme } from '../hooks/useTheme';

interface Command {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly keywords?: string;
  readonly run: () => void;
}

interface CommandPaletteProps {
  readonly theme: Theme;
  readonly onToggleTheme: () => void;
}

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const scrollToSection = (id: string): void => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
};

const openExternal = (href: string): void => {
  window.open(href, '_blank', 'noopener,noreferrer');
};

/** Zero-dependency ⌘K / Ctrl+K palette: jump to sections, open links, copy email, theme, print. */
export const CommandPalette = ({ theme, onToggleTheme }: CommandPaletteProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      ...NAV_SECTIONS.map(section => ({
        id: `go-${section.id}`,
        label: `Go to ${section.label}`,
        hint: 'Section',
        run: () => scrollToSection(section.id),
      })),
      { id: 'github', label: 'Open GitHub profile', hint: 'Link', keywords: 'code repos', run: () => openExternal(PROFILE.github) },
      { id: 'linkedin', label: 'Open LinkedIn', hint: 'Link', run: () => openExternal(PROFILE.linkedin) },
      { id: 'source', label: 'View this site’s source', hint: 'Link', keywords: 'repo github', run: () => openExternal(`${PROFILE.github}/hunters-portfolio`) },
      {
        id: 'email',
        label: 'Copy email address',
        hint: 'Action',
        keywords: 'contact mail',
        run: () => {
          navigator.clipboard
            .writeText(PROFILE.email)
            .then(() => showToast('Email copied'))
            .catch(() => showToast(PROFILE.email));
        },
      },
      {
        id: 'theme',
        label: `Switch to ${theme === THEMES.dark ? 'light' : 'dark'} theme`,
        hint: 'Action',
        keywords: 'dark light mode',
        run: onToggleTheme,
      },
      { id: 'print', label: 'Print / save as PDF', hint: 'Action', keywords: 'resume cv', run: () => window.print() },
    ],
    [theme, onToggleTheme, showToast],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(c => `${c.label} ${c.hint} ${c.keywords ?? ''}`.toLowerCase().includes(q));
  }, [commands, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setCursor(0);
  }, []);

  const runCommand = useCallback(
    (command: Command | undefined) => {
      if (!command) return;
      close();
      command.run();
    },
    [close],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const isPaletteKey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isPaletteKey) {
        event.preventDefault();
        setOpen(current => !current);
        return;
      }
      if (!open && event.key === '/' && !isEditable(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor(c => Math.min(c + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runCommand(results[cursor]);
    } else if (event.key === 'Escape') {
      close();
    }
  };

  return (
    <>
      <button type="button" className="kbd-hint mono" onClick={() => setOpen(true)} aria-label="Open command palette">
        <kbd>⌘</kbd>
        <kbd>K</kbd>
      </button>

      {open
        ? createPortal(
        <div className="palette__backdrop" onClick={close} role="presentation">
          <div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={event => event.stopPropagation()}
          >
            <input
              ref={inputRef}
              className="palette__input"
              type="text"
              placeholder="Type a command or search…"
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setCursor(0);
              }}
              onKeyDown={onInputKey}
              aria-label="Search commands"
              aria-controls="palette-results"
              aria-activedescendant={results[cursor] ? `cmd-${results[cursor].id}` : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            <ul id="palette-results" className="palette__list" role="listbox">
              {results.length === 0 ? (
                <li className="palette__empty mono">No matches</li>
              ) : (
                results.map((command, index) => (
                  <li
                    key={command.id}
                    id={`cmd-${command.id}`}
                    role="option"
                    aria-selected={index === cursor}
                    className={`palette__item${index === cursor ? ' is-active' : ''}`}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => runCommand(command)}
                  >
                    <span>{command.label}</span>
                    <span className="palette__hint mono">{command.hint}</span>
                  </li>
                ))
              )}
            </ul>
            <div className="palette__footer mono">
              <span>↑↓ navigate</span>
              <span>↵ run</span>
              <span>esc close</span>
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}

      {toast
        ? createPortal(
            <div className="toast mono" role="status">
              {toast}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
