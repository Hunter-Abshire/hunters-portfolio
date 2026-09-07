import type { JSX } from 'react';
import { EDUCATION } from '../data/profile';

export const EducationList = (): JSX.Element => (
  <div className="stack">
    {EDUCATION.map(entry => (
      <article key={entry.school} className="card reveal role">
        <p className="role__dates mono">{entry.dates}</p>
        <div>
          <h3 className="card__title">{entry.school}</h3>
          <p className="card__body">
            {entry.degree}
            {entry.note ? <span className="mono"> · {entry.note}</span> : null}
          </p>
        </div>
      </article>
    ))}
  </div>
);
