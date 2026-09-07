import type { JSX } from 'react';
import { PROFILE, SKILL_GROUPS } from '../data/profile';

export const Skills = (): JSX.Element => (
  <div className="stack">
    <div className="skills reveal">
      {SKILL_GROUPS.map(group => (
        <div key={group.name} className="skills__group">
          <h3>{group.name}</h3>
          <ul>
            {group.items.map(item => (
              <li key={item} className="mono">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="card reveal">
      <h3 className="card__title">Certifications</h3>
      <ul className="role__bullets">
        {PROFILE.certifications.map(cert => (
          <li key={cert}>{cert}</li>
        ))}
      </ul>
    </div>
  </div>
);
