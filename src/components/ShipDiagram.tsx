import type { JSX } from 'react';

interface Node {
  readonly id: string;
  readonly label: string;
  readonly sub: string;
}

const NODES: readonly Node[] = [
  { id: 'github', label: 'GitHub', sub: 'push to main' },
  { id: 'actions', label: 'GitHub Actions', sub: 'OIDC → IAM role' },
  { id: 'cdk', label: 'CDK deploy', sub: 'diff → CloudFormation' },
  { id: 's3', label: 'S3', sub: 'private bucket, OAC only' },
  { id: 'cloudfront', label: 'CloudFront', sub: 'TLS 1.2+ · HTTP/3 · headers' },
  { id: 'route53', label: 'Route 53', sub: 'apex + www alias' },
];

const PER_ROW = 3;
const NODE_W = 170;
const NODE_H = 60;
const GAP_X = 44;
const GAP_Y = 44;
const PAD = 4;
const WIDTH = PER_ROW * NODE_W + (PER_ROW - 1) * GAP_X + PAD * 2;
const HEIGHT = 2 * NODE_H + GAP_Y + PAD * 2;

interface Point {
  readonly x: number;
  readonly y: number;
}

/** Snake layout: row 1 left→right, row 2 right→left, so the flow reads as one path. */
const position = (index: number): Point => {
  const row = Math.floor(index / PER_ROW);
  const col = index % PER_ROW;
  const visualCol = row % 2 === 0 ? col : PER_ROW - 1 - col;
  return { x: PAD + visualCol * (NODE_W + GAP_X), y: PAD + row * (NODE_H + GAP_Y) };
};

const edgePath = (from: number, to: number): string => {
  const a = position(from);
  const b = position(to);
  const sameRow = a.y === b.y;
  if (sameRow) {
    const y = a.y + NODE_H / 2;
    const [x1, x2] = a.x < b.x ? [a.x + NODE_W, b.x] : [a.x, b.x + NODE_W];
    return `M ${x1} ${y} L ${x2} ${y}`;
  }
  // Row change: drop straight down from the end node to the start of the next row.
  const x = a.x + NODE_W / 2;
  return `M ${x} ${a.y + NODE_H} L ${x} ${b.y}`;
};

/**
 * The real delivery path of this page, with animated flow along the edges.
 * Pure CSS animation (stroke-dashoffset); paused under prefers-reduced-motion.
 */
export const ShipDiagram = (): JSX.Element => (
  <figure className="ship">
    <svg
      className="ship__svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-labelledby="ship-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="ship-title">
        Deployment path: GitHub push, Actions with OIDC, CDK deploy, S3, CloudFront, Route 53
      </title>
      {NODES.slice(0, -1).map((node, index) => (
        <g key={`edge-${node.id}`}>
          <path className="ship__edge" d={edgePath(index, index + 1)} />
          <path className="ship__flow" d={edgePath(index, index + 1)} />
        </g>
      ))}
      {NODES.map((node, index) => {
        const { x, y } = position(index);
        return (
          <g key={node.id} className="ship__node" transform={`translate(${x} ${y})`}>
            <rect width={NODE_W} height={NODE_H} rx={10} />
            <text className="ship__label" x={NODE_W / 2} y={26} textAnchor="middle">
              {node.label}
            </text>
            <text className="ship__sub" x={NODE_W / 2} y={45} textAnchor="middle">
              {node.sub}
            </text>
          </g>
        );
      })}
    </svg>
    <figcaption className="ship__caption">
      Every push to <span className="mono">main</span> builds the SPA, runs the CDK unit tests, diffs the
      stack, and deploys through a role that GitHub assumes via OIDC. No long-lived AWS keys exist in the
      pipeline. The bucket is private; CloudFront reads it through Origin Access Control and serves
      TLS 1.2+ with strict security headers.
    </figcaption>
  </figure>
);
