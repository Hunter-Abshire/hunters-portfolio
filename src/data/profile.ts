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
    'I build and operate secure, multi-account AWS platforms for a payments company processing $23B+ a year: infrastructure as code, CI/CD, and the security controls that pass PCI and SOC 2 audits without slowing teams down.',
  email: 'hunterkabshire@gmail.com',
  github: 'https://github.com/Hunter-Abshire',
  linkedin: 'https://www.linkedin.com/in/hunter-abshire/',
  resumeHref: '/Hunter-Abshire-Resume.pdf' as string | undefined,
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
    id: 'blockchyp-deploy-platform',
    title: 'Rebuilding a payment gateway’s deployment platform on Fargate and CodeDeploy',
    kicker: 'Stax Payments · Platform',
    problem:
      'BlockChyp’s gateway ran on ECS/EC2 with bridge networking, defined by Troposphere-generated CloudFormation, and every release created and destroyed ECS services instead of updating them. Deploys ran from engineer laptops with long-lived AWS keys.',
    role: 'Owned the program end to end across three epics: CI/CD, ECS refactor, and the Fargate migration.',
    approach:
      'Moved all deployments into GitHub Actions with OIDC deploy roles and retired the access keys. Migrated the templates to AWS CDK (TypeScript) with change sets and drift detection, moved networking to awsvpc, then to Fargate. Replaced the create-and-destroy deploy with persistent services deployed by ECS CodeDeploy blue/green (all-at-once, canary, or linear) with automated rollback. Consolidated images into one DevOps-account ECR and replaced a Datadog sidecar with FireLens shipping logs to CloudWatch, Splunk, and Datadog.',
    outcome:
      'Production cutover in April 2026 with zero customer-facing incidents; legacy EC2 fleet and ECR repos decommissioned two weeks later. Later root-caused a CloudFormation-vs-CodeDeploy conflict to an AWS-side ECS provider change by diffing CloudTrail UpdateService payloads.',
    facts: [
      { value: '3', label: 'AWS accounts' },
      { value: '5', label: 'services to Fargate' },
      { value: '0', label: 'cutover incidents' },
      { value: '0', label: 'long-lived keys left' },
    ],
    tags: ['ECS Fargate', 'CodeDeploy', 'CDK', 'GitHub Actions', 'OIDC', 'FireLens', 'Go'],
  },
  {
    id: 'ghe-migration',
    title: 'Three GitHub organizations into one GitHub Enterprise tenant',
    kicker: 'Stax Payments · CI/CD',
    problem:
      'Three github.com organizations, hundreds of repositories, long-lived bot tokens and AWS keys in Actions secrets, and self-hosted runners all had to move to a new Enterprise Managed Users tenant without stopping deploys.',
    role: 'Core engineer across seven migration tranches: secrets, OIDC trust, tenant hardening, CI cutover, and the runner fleet.',
    approach:
      'Inventoried every Actions secret and variable on github.com, reissued 14 non-recoverable credentials, and re-established AWS OIDC trust in 22 accounts. Hardened the tenant from a blank slate: no-bypass PR-review rulesets, Actions allow-list with read-only default tokens, push protection, 2FA, Splunk audit delivery. Made the shared workflow library org-agnostic and repointed 68 consumer repos; migrated 45 npm and Composer packages to the tenant and CodeArtifact. Built the self-hosted runner fleet and, during a GitHub hosted-runner outage, opened 104 PRs in one sweep to route every workflow through an org-level runner variable.',
    outcome:
      'Deploys never stopped. Secret-scanning backlog cut from 250 open alerts to 24; the shared bot moved from a PAT to a GitHub App minting one-hour tokens across 69 repos; 119 non-admin users revoked from the legacy org.',
    facts: [
      { value: '3 → 1', label: 'GitHub orgs → tenant' },
      { value: '22', label: 'AWS accounts re-trusted' },
      { value: '250 → 24', label: 'secret alerts' },
      { value: '104', label: 'PRs in one sweep' },
    ],
    tags: ['GitHub Enterprise', 'GitHub Actions', 'OIDC', 'Self-hosted runners', 'CodeArtifact', 'Python'],
  },
  {
    id: 'tls-remediation',
    title: 'Organization-wide TLS 1.0/1.1 → 1.2+ remediation',
    kicker: 'Stax Payments · Security',
    problem:
      'Over a hundred API Gateway REST endpoints and ~30 custom domains across a 68-account AWS organization still accepted TLS 1.0 and 1.1, a PCI DSS finding with a hard deadline.',
    role: 'Led the effort end to end: audit, rollout plan, tooling, and cross-team cutover.',
    approach:
      'Wrote a Python audit that scanned 89 accounts across four regions, then phased the rollout dev → staging → prod with per-environment approval and coordinated cutover windows with the four service-owning teams. Defaulted the internal CDK API Gateway construct to TLS 1.2, tracked every gateway in an AWS Config conformance pack, and wired a Jira alert on any resource below 1.2. Extended the same program to the database tier: found the mysql driver’s bundled RDS CA bundle had expired, repinned nine services, and enabled TLS to Aurora from QA through production.',
    outcome:
      'Completed in two weeks with zero production incidents; the finding closed, and redeploys can no longer regress below TLS 1.2.',
    facts: [
      { value: '100+', label: 'REST endpoints' },
      { value: '68', label: 'AWS accounts' },
      { value: '2 wks', label: 'to complete' },
      { value: '0', label: 'prod incidents' },
    ],
    tags: ['API Gateway', 'CDK', 'AWS Config', 'Aurora', 'PCI DSS', 'Python'],
  },
  {
    id: 'secure-file-exchange',
    title: 'Zero-trust file exchange for card token migrations',
    kicker: 'Stax Payments · Platform',
    problem:
      'Importing and exporting card tokens with external processors during merchant migrations relied on a 30-minute manual credential workflow where operators handled plaintext passwords.',
    role: 'Own the system: SFTP platform, access controls, and the self-service provisioning app.',
    approach:
      'AWS Transfer Family SFTP provisioned in Terraform, fronted by AWS Verified Access so only engineering identities can reach it. A self-service app on ECS Fargate drives 11 TypeScript Lambdas that generate credentials, persist only a bcrypt hash, and return the password PGP-encrypted to the recipient’s public key. A second pass made SSH-key auth the default, required a partner PGP key and a security-group rule no wider than /29 on creation, and added user revocation.',
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
      'CDK-defined EventBridge rules in the SecOps delegated-admin account forward findings from all four US regions to a Lambda that normalizes and ships them to Datadog. Datadog monitors page on severity with runbooks linked from the alert. Validated end to end with a live finding before go-live.',
    outcome:
      'Weekly manual review replaced by automated real-time detection; the monitors and troubleshooting runbooks are now part of on-call incident response.',
    facts: [
      { value: '68', label: 'accounts aggregated' },
      { value: 'weekly → real-time', label: 'detection latency' },
    ],
    tags: ['GuardDuty', 'EventBridge', 'Lambda', 'CDK', 'Datadog'],
  },
  {
    id: 'ai-cdk-diff',
    title: 'AI review of infrastructure diffs in CI',
    kicker: 'Stax Payments · Developer tooling',
    problem:
      'CDK changes across dozens of repos were reviewed by eye; breaking changes (replacements, IAM widening) were easy to miss in a raw CloudFormation diff.',
    role: 'Built the proof of concept and productionized it.',
    approach:
      'A TypeScript GitHub Action calls an LLM with the cdk diff output and posts a structured risk summary as a PR comment or Slack message, alongside a critical-change detector that flags stateful-resource replacements before approval.',
    outcome:
      'Rolled out to 30 repositories; every infrastructure change now gets an automated first-pass review before deployment.',
    facts: [{ value: '30', label: 'repos covered' }],
    tags: ['GitHub Actions', 'TypeScript', 'CDK', 'LLM'],
  },
];

export const ROLES: readonly Role[] = [
  {
    company: 'Stax Payments',
    title: 'Software Engineer, Platform & Infrastructure',
    start: 'Mar 2025',
    end: 'Present',
    bullets: [
      'Operate 15+ backend services across a 68-account AWS organization for a payments platform processing $23B+ annually at 99.99%+ uptime.',
      'Rebuilt BlockChyp’s deployment platform: Troposphere → CDK, ECS on EC2 → Fargate, create-and-destroy deploys → CodeDeploy blue/green; April 2026 production cutover with zero customer-facing incidents.',
      'Core engineer on the migration of three GitHub organizations into one GitHub Enterprise tenant: secrets, OIDC trust in 22 accounts, tenant hardening, CI cutover, and the self-hosted runner fleet.',
      'Support PCI DSS and SOC 2 audits with external assessors across three cycles: database audit logging into Splunk, org-wide EBS and SSM public-access blocks with AWS Config auto-remediation, security-group and IAM access reviews.',
      'Built Aurora failover alerting in Terraform-managed Datadog and the on-call runbook behind it; diagnosed incidents from an empty NLB target group to a 95-second metadata-lock convoy.',
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
    items: [
      'AWS (multi-account orgs)',
      'IAM & SCPs',
      'ECS Fargate',
      'CodeDeploy',
      'Lambda',
      'API Gateway',
      'EventBridge',
      'Aurora MySQL',
      'S3 & CloudFront',
      'Transfer Family',
      'AWS Config',
    ],
  },
  {
    name: 'Infrastructure as code',
    items: ['AWS CDK (TypeScript)', 'CloudFormation', 'Terraform', 'Docker', 'Kubernetes'],
  },
  {
    name: 'CI/CD',
    items: ['GitHub Actions', 'GitHub Enterprise administration', 'OIDC', 'Self-hosted runners', 'CodeArtifact'],
  },
  {
    name: 'Security & compliance',
    items: ['PCI DSS', 'SOC 2', 'GuardDuty', 'Verified Access', 'TLS hardening', 'Secret scanning', 'Secrets management'],
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
