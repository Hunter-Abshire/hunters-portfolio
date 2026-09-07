import type { JSX } from 'react';
import { ShipDiagram } from './ShipDiagram';


const formatBuildTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const Colophon = (): JSX.Element => (
  <div className="stack">
    <div className="card reveal">
      <ShipDiagram />
    </div>
    <p className="build-stamp mono">
      build {__BUILD_SHA__.slice(0, 7)} · deployed {formatBuildTime(__BUILD_TIME__)}
    </p>
  </div>
);
