import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { getConfig } from '../config';
import { GithubOidcStack } from '../lib/github-oidc-stack';
import { PortfolioSiteStack } from '../lib/portfolio-site-stack';

const TEST_ENV = { account: '111111111111', region: 'us-east-1' };
const config = getConfig('prod');

/** BucketDeployment needs a real directory to hash; fake a Vite dist. */
const makeFakeDist = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-dist-'));
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html>');
  fs.writeFileSync(path.join(dir, 'assets', 'app-abc123.js'), '');
  return dir;
};

const synthSite = (): Template => {
  const app = new cdk.App({
    context: {
      [`hosted-zone:account=${TEST_ENV.account}:domainName=${config.domainName}:region=${TEST_ENV.region}`]:
        { Id: '/hostedzone/ZTESTZONE', Name: `${config.domainName}.` },
    },
  });
  const stack = new PortfolioSiteStack(app, 'Site', {
    env: TEST_ENV,
    config,
    siteDistPath: makeFakeDist(),
  });
  return Template.fromStack(stack);
};

describe('PortfolioSiteStack', () => {
  const template = synthSite();

  test('site bucket is private, encrypted, TLS-only and retained', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
      Properties: Match.objectLike({
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        BucketEncryption: Match.anyValue(),
      }),
    });
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Deny',
            Action: 's3:*',
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          }),
        ]),
      }),
    });
  });

  test('bucket policy only grants read to this CloudFront distribution', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: 's3:GetObject',
            Principal: { Service: 'cloudfront.amazonaws.com' },
            Condition: {
              StringEquals: { 'AWS:SourceArn': Match.anyValue() },
            },
          }),
        ]),
      }),
    });
  });

  test('distribution enforces TLS 1.2+, HTTPS redirect, custom domains and SPA fallbacks', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Aliases: [config.domainName, ...config.alternateDomainNames],
        ViewerCertificate: Match.objectLike({ MinimumProtocolVersion: 'TLSv1.2_2021' }),
        DefaultCacheBehavior: Match.objectLike({ ViewerProtocolPolicy: 'redirect-to-https' }),
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({ ErrorCode: 403, ResponseCode: 200, ResponsePagePath: '/index.html' }),
          Match.objectLike({ ErrorCode: 404, ResponseCode: 200, ResponsePagePath: '/index.html' }),
        ]),
      }),
    });
    template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
  });

  test('certificate is DNS-validated and covers every alias', () => {
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: config.domainName,
      SubjectAlternativeNames: [...config.alternateDomainNames],
      ValidationMethod: 'DNS',
    });
  });

  test('A and AAAA alias records exist for apex and www', () => {
    const domains = [config.domainName, ...config.alternateDomainNames];
    template.resourceCountIs('AWS::Route53::RecordSet', domains.length * 2);
    domains.forEach(domain => {
      ['A', 'AAAA'].forEach(type => {
        template.hasResourceProperties('AWS::Route53::RecordSet', {
          Name: `${domain}.`,
          Type: type,
          AliasTarget: Match.objectLike({ DNSName: Match.anyValue() }),
        });
      });
    });
  });
});

describe('GithubOidcStack', () => {
  const app = new cdk.App();
  const stack = new GithubOidcStack(app, 'Oidc', { env: TEST_ENV, config });
  const template = Template.fromStack(stack);

  test('trust policy is limited to the deploy branch / environment of the one repo', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          Match.objectLike({
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
              StringLike: {
                'token.actions.githubusercontent.com:sub': [
                  `repo:${config.githubRepository}:ref:refs/heads/${config.githubBranch}`,
                  `repo:${config.githubRepository}:environment:${config.githubEnvironment}`,
                  `repo:Hunter-Abshire@${config.githubOwnerId}/hunters-portfolio@${config.githubRepositoryId}:ref:refs/heads/${config.githubBranch}`,
                  `repo:Hunter-Abshire@${config.githubOwnerId}/hunters-portfolio@${config.githubRepositoryId}:environment:${config.githubEnvironment}`,
                ],
              },
            },
          }),
        ],
      }),
    });
  });

  test('role can only assume the CDK bootstrap roles in this account/region', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          Match.objectLike({
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Resource: Match.objectLike({
              'Fn::Join': Match.arrayWith([
                Match.arrayWith([
                  Match.stringLikeRegexp(`cdk-\\*-\\*-role-${TEST_ENV.account}-${TEST_ENV.region}`),
                ]),
              ]),
            }),
          }),
        ],
        Version: '2012-10-17',
      },
    });
    // No wildcard actions anywhere.
    const policies = template.findResources('AWS::IAM::Policy');
    Object.values(policies).forEach(policy => {
      const statements = (policy as { Properties: { PolicyDocument: { Statement: { Action: string | string[] }[] } } })
        .Properties.PolicyDocument.Statement;
      statements.forEach(s => expect([s.Action].flat()).not.toContain('*'));
    });
  });
});
