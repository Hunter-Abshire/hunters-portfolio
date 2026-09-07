#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getConfig } from '../config';
import { GithubOidcStack } from '../lib/github-oidc-stack';
import { PortfolioSiteStack } from '../lib/portfolio-site-stack';

const app = new cdk.App();
const config = getConfig(app.node.tryGetContext('env') ?? 'prod');

// Account/region come from the active credentials (never hardcoded).
// CloudFront requires the ACM certificate in us-east-1, so the site stack is pinned there.
const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

new GithubOidcStack(app, `HuntersPortfolio-GithubOidc-${config.envName}`, { env, config });

new PortfolioSiteStack(app, `HuntersPortfolio-Site-${config.envName}`, {
  env,
  config,
  siteDistPath: '../dist',
});

Object.entries(config.tags).forEach(([key, value]) => cdk.Tags.of(app).add(key, value));
