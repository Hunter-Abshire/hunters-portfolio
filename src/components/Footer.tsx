import type { JSX } from 'react';
import { PROFILE } from '../data/profile';

const REPO_URL = `${PROFILE.github}/hunters-portfolio`;

export const Footer = (): JSX.Element => (
  <footer className="footer">
    <p>
      Built with React and Vite, hosted on S3 behind CloudFront with an ACM certificate and Route 53, all
      defined in AWS CDK. Deployed from GitHub Actions through OIDC, so no long-lived AWS keys exist
      anywhere in the pipeline.{' '}
      <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
        Source on GitHub
      </a>
      .
    </p>
    <p className="mono">© {new Date().getFullYear()} {PROFILE.name}</p>
  </footer>
);
