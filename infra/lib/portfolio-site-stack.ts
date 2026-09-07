import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { SiteConfig } from '../config';

export interface PortfolioSiteStackProps extends cdk.StackProps {
  readonly config: SiteConfig;
  /** Built SPA output (Vite `dist/`). Relative paths resolve from the infra dir. */
  readonly siteDistPath: string;
}

/** Vite emits hashed filenames under assets/, so those can be cached forever. */
const IMMUTABLE_ASSETS_PREFIX = 'assets/';

/**
 * Static SPA hosting: private S3 origin behind CloudFront (OAC), ACM cert via
 * DNS validation, apex + www alias records, and content upload with invalidation.
 * Must live in us-east-1 because CloudFront only accepts certificates from there.
 */
export class PortfolioSiteStack extends cdk.Stack {
  readonly bucket: s3.Bucket;
  readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: PortfolioSiteStackProps) {
    super(scope, id, props);
    const { config, siteDistPath } = props;
    const allDomainNames = [config.domainName, ...config.alternateDomainNames];

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: config.domainName,
    });

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: config.domainName,
      subjectAlternativeNames: [...config.alternateDomainNames],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    this.bucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const securityHeaders = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(365),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        xssProtection: { protection: true, modeBlock: true, override: true },
      },
    });

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `${config.tags.project} (${config.envName})`,
      domainNames: allDomainNames,
      certificate,
      defaultRootObject: 'index.html',
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeaders,
        compress: true,
      },
      // SPA routing: S3 returns 403 for unknown keys (OAC, no ListBucket), so map
      // both 403 and 404 back to the app shell and let the router render.
      errorResponses: [403, 404].map(httpStatus => ({
        httpStatus,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: cdk.Duration.minutes(5),
      })),
    });

    const aliasTarget = route53.RecordTarget.fromAlias(
      new targets.CloudFrontTarget(this.distribution),
    );
    allDomainNames.forEach(recordName => {
      new route53.ARecord(this, `ARecord-${recordName}`, {
        zone: hostedZone,
        recordName,
        target: aliasTarget,
      });
      new route53.AaaaRecord(this, `AaaaRecord-${recordName}`, {
        zone: hostedZone,
        recordName,
        target: aliasTarget,
      });
    });

    const distDir = path.resolve(__dirname, '..', siteDistPath);

    // Hashed assets: cache forever. Everything else (index.html, favicon, robots):
    // always revalidate so a deploy is visible immediately after invalidation.
    new s3deploy.BucketDeployment(this, 'DeployAssets', {
      destinationBucket: this.bucket,
      destinationKeyPrefix: IMMUTABLE_ASSETS_PREFIX,
      sources: [s3deploy.Source.asset(path.join(distDir, IMMUTABLE_ASSETS_PREFIX))],
      prune: true,
      cacheControl: [
        s3deploy.CacheControl.maxAge(cdk.Duration.days(365)),
        s3deploy.CacheControl.immutable(),
      ],
    });
    new s3deploy.BucketDeployment(this, 'DeployRoot', {
      destinationBucket: this.bucket,
      sources: [s3deploy.Source.asset(distDir, { exclude: [`${IMMUTABLE_ASSETS_PREFIX}*`] })],
      // prune would delete assets/ uploaded by the other deployment.
      prune: false,
      cacheControl: [s3deploy.CacheControl.noCache()],
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'SiteUrl', { value: `https://${config.domainName}` });
    new cdk.CfnOutput(this, 'DistributionId', { value: this.distribution.distributionId });
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, 'SiteBucketName', { value: this.bucket.bucketName });
  }
}
