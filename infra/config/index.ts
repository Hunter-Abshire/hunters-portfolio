export type EnvName = 'prod';

export interface SiteConfig {
  /** Environment name; drives stack names and the `environment` tag. */
  readonly envName: EnvName;
  /** Apex domain served by CloudFront and looked up in Route 53. */
  readonly domainName: string;
  /** Extra hostnames on the same distribution and certificate (e.g. www). */
  readonly alternateDomainNames: readonly string[];
  /** GitHub `owner/repo` allowed to assume the deploy role via OIDC. */
  readonly githubRepository: string;
  /** Branch whose pushes may deploy. */
  readonly githubBranch: string;
  /** GitHub Actions environment name used in the OIDC `sub` claim. */
  readonly githubEnvironment: string;
  readonly tags: Readonly<Record<'environment' | 'owner' | 'project', string>>;
}

const CONFIGS: Readonly<Record<EnvName, SiteConfig>> = {
  prod: {
    envName: 'prod',
    domainName: 'hunters-portfolio.com',
    alternateDomainNames: ['www.hunters-portfolio.com'],
    githubRepository: 'Hunter-Abshire/hunters-portfolio',
    githubBranch: 'main',
    githubEnvironment: 'prod',
    tags: { environment: 'prod', owner: 'hunter-abshire', project: 'hunters-portfolio' },
  },
} as const;

export const getConfig = (envName: string): SiteConfig => {
  const config = CONFIGS[envName as EnvName];
  if (!config) {
    throw new Error(`Unknown env "${envName}". Known envs: ${Object.keys(CONFIGS).join(', ')}`);
  }
  return config;
};
