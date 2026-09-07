# hunters-portfolio

Source for [hunters-portfolio.com](https://hunters-portfolio.com): a single-page React portfolio, hosted on S3 behind CloudFront and deployed from GitHub Actions via OIDC. Infrastructure is AWS CDK (TypeScript) in `infra/`.

## Overview

```
GitHub Actions (OIDC) ──cdk deploy──▶ CloudFormation
                                        ├─ ACM certificate (DNS-validated)
                                        ├─ S3 bucket (private, OAC)  ◀── BucketDeployment (dist/)
                                        ├─ CloudFront distribution (TLS 1.2+, HTTP/3, security headers)
                                        └─ Route 53 A/AAAA aliases: apex + www
```

- `src/` — Vite + React 19 + TypeScript. All content lives in [`src/data/profile.ts`](src/data/profile.ts); components only render it.
- `src/styles/tokens.css` — the visual theme ("Terminal Slate"). Change tokens to re-theme.
- `infra/` — self-contained CDK app with two stacks:
  - `HuntersPortfolio-GithubOidc-prod`: GitHub OIDC provider + deploy role (deployed once, by hand).
  - `HuntersPortfolio-Site-prod`: certificate, bucket, distribution, DNS records, content upload + invalidation.
- `.github/workflows/deploy.yml` — build, test, `cdk diff`, `cdk deploy` on push to `main`.
- `.github/workflows/ci.yml` — lint, build, infra unit tests on pull requests.

## Install & run locally

```sh
npm ci
npm run dev          # http://localhost:5173
npm run lint
npm run build        # -> dist/
npm run preview
```

Infra:

```sh
cd infra
npm ci
npm test             # CDK assertions (bucket privacy, TLS policy, OIDC trust, IAM scope)
npx cdk synth
```

## First-time bootstrap (one time, from a workstation)

Prerequisites: the apex domain registered in Route 53 in the target account (a public hosted zone must exist), and CDK bootstrapped in `us-east-1`.

```sh
export AWS_PROFILE=<personal-account-profile>
npm ci && npm run build            # infra needs dist/ to exist for synth
cd infra && npm ci
npx cdk diff HuntersPortfolio-GithubOidc-prod
npx cdk deploy HuntersPortfolio-GithubOidc-prod
# copy the DeployRoleArn output into the GitHub environment secret:
gh secret set AWS_DEPLOY_ROLE_ARN --env prod --body "<role arn>"
```

Then push to `main`; the workflow deploys the site stack. The first deploy waits on ACM DNS validation (usually a few minutes).

## Deploying manually

```sh
npm run build
cd infra
npx cdk diff HuntersPortfolio-Site-prod      # always diff first
npx cdk deploy HuntersPortfolio-Site-prod
```

## Logging & debugging

- CloudFront and S3 have no access logging enabled (personal site; enable `logBucket` on the distribution if needed).
- Deploy failures surface in the Actions run; the `BucketDeployment` custom-resource Lambda logs to CloudWatch under `/aws/lambda/HuntersPortfolio-Site-prod-CustomCDKBucketDeployment*`.
- SPA fallback: 403/404 from the origin are rewritten to `/index.html` with a 200.

## Content

Edit `src/data/profile.ts`. The file is public: keep phone numbers and anything private out of it. To publish a resume PDF, drop it in `public/` and set `PROFILE.resumeHref`.
