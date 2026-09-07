import type { JSX, ReactNode } from 'react';

interface SectionProps {
  readonly id: string;
  readonly index: number;
  readonly title: string;
  readonly children: ReactNode;
}

export const Section = ({ id, index, title, children }: SectionProps): JSX.Element => (
  <section id={id} aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`} className="section__heading">
      <span className="mono">{String(index).padStart(2, '0')}.</span>
      {title}
    </h2>
    {children}
  </section>
);
