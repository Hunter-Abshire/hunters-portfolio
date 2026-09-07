import type { JSX } from 'react';
import { ROLES } from '../data/profile';
import { Tags } from './Tags';

export const Experience = (): JSX.Element => (
  <div className="stack">
    {ROLES.map(role => (
      <article key={`${role.company}-${role.start}`} className="card reveal role">
        <p className="role__dates mono">
          {role.start} — {role.end}
        </p>
        <div>
          <h3 className="card__title">
            {role.title} · <span className="card__kicker">{role.company}</span>
          </h3>
          <ul className="role__bullets">
            {role.bullets.map(bullet => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <Tags items={role.tags} />
        </div>
      </article>
    ))}
  </div>
);
