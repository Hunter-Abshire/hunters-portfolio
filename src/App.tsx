import type { JSX } from 'react';
import { Colophon } from './components/Colophon';
import { CommandPalette } from './components/CommandPalette';
import { CursorGlow } from './components/CursorGlow';
import { EducationList } from './components/EducationList';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Rail } from './components/Rail';
import { ScrollProgress } from './components/ScrollProgress';
import { Section } from './components/Section';
import { Skills } from './components/Skills';
import { Work } from './components/Work';
import { useCardSpotlight } from './hooks/useCardSpotlight';
import { useReveal } from './hooks/useReveal';
import { useTheme } from './hooks/useTheme';

const App = (): JSX.Element => {
  const { theme, toggleTheme } = useTheme();
  useReveal();
  useCardSpotlight();

  return (
    <div className="layout">
      <ScrollProgress />
      <CursorGlow />
      <Rail
        theme={theme}
        onToggleTheme={toggleTheme}
        extras={<CommandPalette theme={theme} onToggleTheme={toggleTheme} />}
      />
      <main className="main">
        <Section id="work" index={1} title="Selected work">
          <Work />
        </Section>
        <Section id="experience" index={2} title="Experience">
          <Experience />
        </Section>
        <Section id="skills" index={3} title="Skills">
          <Skills />
        </Section>
        <Section id="education" index={4} title="Education">
          <EducationList />
        </Section>
        <Section id="colophon" index={5} title="How this site ships">
          <Colophon />
        </Section>
        <Footer />
      </main>
    </div>
  );
};

export default App;
