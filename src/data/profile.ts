// Single source of truth for site content. Edit here, not in components.
// Deliberately omits phone number: this file is published to a public repo.

export interface Link {
  readonly label: string;
  readonly href: string;
}

export interface CaseStudy {
  readonly id: string;
  readonly title: string;
  readonly kicker: string;
  readonly problem: string;
  readonly role: string;
  readonly approach: string;
  readonly outcome: string;
  readonly facts: readonly { readonly value: string; readonly label: string }[];
  readonly tags: readonly string[];
}

export interface Role {
  readonly company: string;
  readonly title: string;
  readonly start: string;
  readonly end: string;
  readonly location?: string;
  readonly bullets: readonly string[];
  readonly tags: readonly string[];
}

export interface SkillGroup {
  readonly name: string;
  readonly items: readonly string[];
}

export interface Education {
  readonly school: string;
  readonly degree: string;
  readonly dates: string;
  readonly note?: string;
}

export const PROFILE = {
  name: 'Hunter Abshire',
  title: 'Software Engineer, Platform & Infrastructure',
  location: 'Lexington, KY',
  summary:
    'I build and operate secure, multi-account AWS platforms: infrastructure as code, CI/CD, and the security controls that let payment systems pass audits without slowing teams down.',
  email: 'hunterkabshire@gmail.com',
  github: 'https://github.com/Hunter-Abshire',
  linkedin: 'https://www.linkedin.com/in/hunter-abshire/',
  // Intentionally no resume PDF: the site itself is the resume. Set to a public/ path to enable the button.
  resumeHref: undefined as string | undefined,
  certifications: [
    'AWS Certified Solutions Architect – Professional',
    'AWS Certified Security – Specialty',
    'AWS Certified Solutions Architect – Associate',
    'AWS Certified Developer – Associate',
    'AWS Certified SysOps Administrator – Associate',
    'AWS Certified Cloud Practitioner',
  ],
} as const;

export const NAV_SECTIONS = [
  { id: 'work', label: 'Selected work' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'colophon', label: 'How this site ships' },
] as const;

export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    id: 'tls-remediation',
    title: 'Organization-wide TLS 1.0/1.1 → 1.2+ remediation',
    kicker: 'Stax Payments · Security',
    problem:
      'Over a hundred API Gateway REST endpoints and ~30 custom domains across a 68-account AWS organization still accepted TLS 1.0 and 1.1, a PCI DSS finding with a hard deadline.',
    role: 'Led the effort end to end: audit, rollout plan, tooling, and cross-team cutover.',
    approach:
      'Audited posture account by account with scripted read-only sweeps, then phased the rollout dev → staging → prod with per-environment approval. Fixed the IaC (CDK and Terraform) so redeploys could not regress, and coordinated cutover windows with the four service-owning teams.',
    outcome:
      'Completed in two weeks with zero production incidents; the finding closed and redeploys now enforce TLS 1.2+ by default.',
    facts: [
      { value: '100+', label: 'REST endpoints' },
      { value: '68', label: 'AWS accounts' },
      { value: '2 wks', label: 'to complete' },
      { value: '0', label: 'prod incidents' },
    ],
    tags: ['API Gateway', 'CDK', 'Terraform', 'PCI DSS', 'Python'],
  },
  {
    id: 'secure-file-exchange',
    title: 'Zero-trust file exchange for card token migrations',
    kicker: 'Stax Payments · Platform',
    problem:
      'Importing and exporting card tokens with external processors during merchant migrations relied on a 30-minute manual credential workflow where operators handled plaintext passwords.',
    role: 'Own the system: SFTP platform, access controls, and the self-service provisioning app.',
    approach:
      'AWS Transfer Family SFTP provisioned in Terraform, fronted by AWS Verified Access so only engineering identities can reach it. A self-service app on ECS Fargate drives 11 TypeScript Lambdas that generate credentials, persist only a bcrypt hash, and return the password PGP-encrypted to the recipient’s public key.',
    outcome:
      'No operator ever sees a plaintext credential. Fifteen processor organizations onboarded through the self-service flow.',
    facts: [
      { value: '15', label: 'processors onboarded' },
      { value: '30 min → 0', label: 'manual work per credential' },
      { value: '11', label: 'Lambdas' },
    ],
    tags: ['Transfer Family', 'Verified Access', 'ECS Fargate', 'Lambda', 'TypeScript', 'PGP'],
  },
  {
    id: 'guardduty-pipeline',
    title: 'Real-time security alerting across 68 accounts',
    kicker: 'Stax Payments · Security',
    problem:
      'GuardDuty findings were reviewed weekly by hand, per account. Critical detections could sit unseen for days.',
    role: 'Designed and built the pipeline; authored the monitors and runbooks used on call.',
    approach:
      'CDK-defined EventBridge rules in every account forward findings to a central bus, where a Lambda normalizes and ships them to Datadog. Datadog monitors page on severity with runbooks linked from the alert.',
    outcome:
      'Weekly manual review replaced by automated real-time detection; the monitors and troubleshooting runbooks are now part of on-call incident response.',
    facts: [
      { value: '68', label: 'accounts aggregated' },
      { value: 'weekly → real-time', label: 'detection latency' },
    ],
    tags: ['GuardDuty', 'EventBridge', 'Lambda', 'CDK', 'Datadog'],
  },
  {
    id: 'ghe-migration',
    title: 'GitHub Enterprise migration with keyless AWS auth',
    kicker: 'Stax Payments · CI/CD',
    problem:
      'Two GitHub organizations, long-lived AWS keys in Actions secrets, and self-hosted runners all had to move to a new GitHub Enterprise tenant without stopping deploys.',
    role: 'Led the migration: OIDC design, runner fleet, and the secrets/variables inventory.',
    approach:
      'Configured OpenID Connect trust so workflows assume AWS roles keylessly, deployed 12 enterprise-level self-hosted runners across runner groups, and audited every secret and variable in both source organizations before cutover.',
    outcome: 'Zero CI/CD disruption during cutover; legacy operations users decommissioned afterwards.',
    facts: [
      { value: '12', label: 'self-hosted runners' },
      { value: '2 → 1', label: 'GitHub orgs' },
      { value: '0', label: 'CI disruption' },
    ],
    tags: ['GitHub Actions', 'OIDC', 'IAM', 'Self-hosted runners'],
  },
  {
    id: 'ai-cdk-diff',
    title: 'AI review of infrastructure diffs in CI',
    kicker: 'Stax Payments · Developer tooling',
    problem:
      'CDK changes across dozens of repos were reviewed by eye; breaking changes (replacements, IAM widening) were easy to miss in a raw CloudFormation diff.',
    role: 'Built the proof of concept and productionized it.',
    approach:
      'A TypeScript GitHub Action calls an LLM with the cdk diff output and posts a structured risk summary as a PR comment or Slack message.',
    outcome:
      'Rolled out to 30 repositories; every infrastructure change now gets an automated first-pass review before deployment.',
    facts: [{ value: '30', label: 'repos covered' }],
    tags: ['GitHub Actions', 'TypeScript', 'CDK', 'LLM'],
  },
  {
    id: 'k8s-networking-lab',
    title: 'Kubernetes SRE and packet-level networking lab',
    kicker: 'Independent project',
    problem:
      'Understand how Service traffic really reaches a pod, and practice diagnosing production-style failures rather than reading about them.',
    role: 'Built and broke everything myself.',
    approach:
      'Three-node cluster on Cilium’s eBPF CNI running replicated nginx and Redis tiers. Injected failures (broken selectors and Endpoints, network-policy-blocked Redis, failed rollouts, DNS misconfiguration) and traced Service-to-pod traffic through network namespaces and veth pairs with tcpdump and conntrack.',
    outcome:
      'Can distinguish a ClusterIP DNAT problem from a policy drop from a silent reset by looking at the packets, not the dashboards.',
    facts: [
      { value: '3', label: 'nodes' },
      { value: 'eBPF', label: 'dataplane' },
    ],
    tags: ['Kubernetes', 'Cilium', 'eBPF', 'tcpdump', 'Linux networking'],
  },
];

export const ROLES: readonly Role[] = [
  {
    company: 'Stax Payments',
    title: 'Software Engineer, Platform & Infrastructure',
    start: '2025',
    end: 'Present',
    bullets: [
      'Operate 15+ backend services and platform infrastructure for a payments platform processing $23B+ annually at 99.99%+ uptime, across separate dev, staging, and production AWS accounts.',
      'Migrated BlockChyp services from ECS on EC2 to Fargate with CDK, including centralizing ECR into a DevOps account and decommissioning the legacy fleet.',
      'Implemented database audit logging across MySQL, PostgreSQL, SQL Server, and Oracle with Splunk and Datadog ingestion for PCI DSS evidence.',
      'Authored Service Control Policies and org-wide SSM sharing restrictions; support PCI DSS audits with external assessors.',
    ],
    tags: ['AWS', 'CDK', 'TypeScript', 'Python', 'Terraform', 'GitHub Actions', 'Datadog'],
  },
  {
    company: 'Chick-fil-A, Inc.',
    title: 'Software Engineer Intern',
    start: 'May 2024',
    end: 'Aug 2024',
    bullets: [
      'Built a conversational AI assistant on Slack for a 4,000-member workspace that reduced help-channel load by 50%, on Amazon Kendra, Lambda, API Gateway, S3, and Vertex AI.',
      'Developed a Backstage plugin in React that surfaces AWS financial data through REST APIs.',
    ],
    tags: ['Python', 'Lambda', 'Kendra', 'React', 'Backstage'],
  },
];

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    name: 'Cloud',
    items: ['AWS (multi-account orgs)', 'IAM & SCPs', 'Lambda', 'ECS Fargate', 'API Gateway', 'EventBridge', 'Aurora MySQL', 'S3 & CloudFront', 'Route 53'],
  },
  {
    name: 'Infrastructure as code',
    items: ['AWS CDK (TypeScript)', 'CloudFormation', 'Terraform', 'Docker'],
  },
  {
    name: 'CI/CD',
    items: ['GitHub Actions', 'GitHub Enterprise', 'OIDC', 'Self-hosted runners'],
  },
  {
    name: 'Security & compliance',
    items: ['PCI DSS', 'GuardDuty', 'Verified Access', 'TLS hardening', 'Secrets management'],
  },
  {
    name: 'Observability',
    items: ['Datadog', 'CloudWatch', 'Splunk'],
  },
  {
    name: 'Languages',
    items: ['TypeScript', 'Python', 'SQL', 'Go', 'Java'],
  },
];

export const EDUCATION: readonly Education[] = [
  {
    school: 'Georgia Institute of Technology',
    degree: 'M.S. Computer Science',
    dates: '2025 – 2028 (expected)',
    note: '4.0 GPA',
  },
  {
    school: 'University of Kentucky',
    degree: 'B.S. Computer Engineering & B.S. Computer Science',
    dates: '2025',
    note: '3.89 GPA',
  },
];
