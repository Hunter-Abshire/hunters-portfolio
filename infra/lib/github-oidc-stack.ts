import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { SiteConfig } from '../config';

export interface GithubOidcStackProps extends cdk.StackProps {
  readonly config: SiteConfig;
}

const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';

export const githubSubjectPrefixes = (config: SiteConfig): string[] => {
  const [owner, name] = config.githubRepository.split('/');
  return [
    `repo:${owner}/${name}`,
    `repo:${owner}@${config.githubOwnerId}/${name}@${config.githubRepositoryId}`,
  ];
};

/**
 * GitHub Actions -> AWS keyless auth. Deployed once by hand; afterwards every
 * deploy runs from the workflow via the role exported here.
 *
 * The role itself holds no AWS permissions beyond assuming the CDK bootstrap
 * roles, so the blast radius of a compromised workflow is bounded by what
 * `cdk deploy` needs for this app.
 */
export class GithubOidcStack extends cdk.Stack {
  readonly deployRole: iam.Role;

  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);
    const { config } = props;

    const provider = new iam.OidcProviderNative(this, 'GithubOidcProvider', {
      url: `https://${GITHUB_OIDC_HOST}`,
      clientIds: ['sts.amazonaws.com'],
    });

    // Only pushes to the deploy branch, or jobs bound to the deploy environment,
    // may assume the role. Anything else from the repo (PRs, other branches) is denied.
    // GitHub emits either the legacy subject (`repo:owner/name:...`) or the immutable one
    // (`repo:owner@ID/name@ID:...`) depending on the repo's OIDC settings; accept both.
    const allowedSubjects = githubSubjectPrefixes(config).flatMap(prefix => [
      `${prefix}:ref:refs/heads/${config.githubBranch}`,
      `${prefix}:environment:${config.githubEnvironment}`,
    ]);

    this.deployRole = new iam.Role(this, 'GithubDeployRole', {
      roleName: `${config.tags.project}-github-deploy`,
      description: `GitHub Actions deploy role for ${config.githubRepository}`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.oidcProviderArn, {
        StringEquals: { [`${GITHUB_OIDC_HOST}:aud`]: 'sts.amazonaws.com' },
        StringLike: { [`${GITHUB_OIDC_HOST}:sub`]: allowedSubjects },
      }),
    });

    // `cdk deploy` assumes the bootstrap roles (lookup / file-publishing / deploy)
    // which carry the real permissions. Scoped to this account+region's bootstrap.
    this.deployRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'AssumeCdkBootstrapRoles',
        actions: ['sts:AssumeRole'],
        resources: [
          cdk.Stack.of(this).formatArn({
            service: 'iam',
            region: '',
            resource: 'role',
            resourceName: `cdk-*-*-role-${this.account}-${this.region}`,
          }),
        ],
      }),
    );

    new cdk.CfnOutput(this, 'DeployRoleArn', {
      value: this.deployRole.roleArn,
      description: 'Set this as the AWS_DEPLOY_ROLE_ARN secret in the GitHub repo',
    });
  }
}
