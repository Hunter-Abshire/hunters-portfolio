import type { JSX } from 'react';
import { NAV_SECTIONS, PROFILE } from '../data/profile';
import { useActiveSection } from '../hooks/useActiveSection';
import type { Theme } from '../hooks/useTheme';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';

interface RailProps {
  readonly theme: Theme;
  readonly onToggleTheme: () => void;
}

const SECTION_IDS = NAV_SECTIONS.map(section => section.id);

export const Rail = ({ theme, onToggleTheme }: RailProps): JSX.Element => {
  const active = useActiveSection(SECTION_IDS);

  return (
    <header className="rail">
      <div>
        <p className="hero__eyebrow mono">~/hunter-abshire</p>
        <h1 className="hero__name">{PROFILE.name}</h1>
        <p className="hero__title">{PROFILE.title}</p>
        <p className="hero__summary">{PROFILE.summary}</p>
        <div className="hero__meta mono">
          <span>{PROFILE.location}</span>
          <span>AWS Certified ×{PROFILE.certifications.length}</span>
        </div>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#work">
            Selected work
          </a>
          {PROFILE.resumeHref ? (
            <a className="btn" href={PROFILE.resumeHref} target="_blank" rel="noreferrer">
              Resume
            </a>
          ) : null}
          <a className="btn" href={`mailto:${PROFILE.email}`}>
            Contact
          </a>
        </div>

        <nav className="nav" aria-label="Sections">
          <ul>
            {NAV_SECTIONS.map(section => (
              <li key={section.id}>
                <a
                  className={`nav__link mono${active === section.id ? ' is-active' : ''}`}
                  href={`#${section.id}`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="rail__footer">
        <a className="icon-link" href={PROFILE.github} target="_blank" rel="noreferrer" aria-label="GitHub">
          <GithubIcon />
        </a>
        <a className="icon-link" href={PROFILE.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <LinkedinIcon />
        </a>
        <a className="icon-link" href={`mailto:${PROFILE.email}`} aria-label="Email">
          <MailIcon />
        </a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
};
