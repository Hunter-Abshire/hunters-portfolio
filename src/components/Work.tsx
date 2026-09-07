import type { JSX } from 'react';
import { CASE_STUDIES, type CaseStudy } from '../data/profile';
import { Tags } from './Tags';

const CaseStudyCard = ({ study, index }: { readonly study: CaseStudy; readonly index: number }): JSX.Element => (
  <article className="card reveal" id={study.id} style={{ '--reveal-delay': `${(index % 3) * 70}ms` } as React.CSSProperties}>
    <div className="card__top">
      <h3 className="card__title">{study.title}</h3>
      <span className="card__kicker mono">{study.kicker}</span>
    </div>
    <dl className="detail">
      <dt className="mono">Problem</dt>
      <dd>{study.problem}</dd>
      <dt className="mono">Role</dt>
      <dd>{study.role}</dd>
      <dt className="mono">Approach</dt>
      <dd>{study.approach}</dd>
      <dt className="mono">Outcome</dt>
      <dd>{study.outcome}</dd>
    </dl>
    <div className="facts">
      {study.facts.map(fact => (
        <div key={fact.label}>
          <div className="fact__value mono">{fact.value}</div>
          <div className="fact__label">{fact.label}</div>
        </div>
      ))}
    </div>
    <Tags items={study.tags} />
  </article>
);

export const Work = (): JSX.Element => (
  <div className="stack">
    {CASE_STUDIES.map((study, index) => (
      <CaseStudyCard key={study.id} study={study} index={index} />
    ))}
  </div>
);
