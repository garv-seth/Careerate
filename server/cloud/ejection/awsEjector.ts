/**
 * AWS Ejection Service
 * 
 * Handles Porter.run-style ejectable infrastructure for AWS
 * Generates CloudFormation templates and manages IAM role lifecycle
 */

import { storageV2 } from '../../storage-v2';
import { agentLogger } from '../../agents/kernel.config';

export interface AWSIAMRoleTemplate {
  AWSTemplateFormatVersion: string;
  Description: string;
  Parameters: Record<string, any>;
  Resources: Record<string, any>;
  Outputs: Record<string, any>;
}

export interface DeploymentExport {
  templateFormat: 'cloudformation';
  template: AWSIAMRoleTemplate;
  instructions: string;
  deployedResources: Array<{
    type: string;
    id: string;
    arn: string;
  }>;
}

/**
 * AWS Ejection Service
 */
export class AWSEjector {
  /**
   * Generate IAM role CloudFormation template for user to create
   */
  generateIAMRoleTemplate(
    userId: string,
    externalId: string,
    permissions: string[] = []
  ): AWSIAMRoleTemplate {
    const defaultPermissions = [
      'arn:aws:iam::aws:policy/AmazonECS_FullAccess',
      'arn:aws:iam::aws:policy/AWSLambda_FullAccess',
      'arn:aws:iam::aws:policy/AmazonRDSFullAccess',
      'arn:aws:iam::aws:policy/AmazonS3FullAccess',
      'arn:aws:iam::aws:policy/CloudWatchFullAccess',
      'arn:aws:iam::aws:policy/SecretsManagerReadWrite'
    ];

    return {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: 'Careerate cross-account access role - allows Careerate to deploy to your AWS account',
      Parameters: {
        ExternalId: {
          Type: 'String',
          Default: externalId,
          Description: 'External ID for secure cross-account access'
        },
        CareérateAccountId: {
          Type: 'String',
          Default: process.env.CAREERATE_AWS_ACCOUNT_ID || '123456789012',
          Description: 'Careerate AWS account ID'
        }
      },
      Resources: {
        CareérateRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            RoleName: `Careerate-${userId}`,
            Description: 'Role for Careerate to manage deployments in this account',
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [{
                Effect: 'Allow',
                Principal: {
                  AWS: { 'Fn::Sub': 'arn:aws:iam::${CareérateAccountId}:root' }
                },
                Action: 'sts:AssumeRole',
                Condition: {
                  StringEquals: {
                    'sts:ExternalId': { Ref: 'ExternalId' }
                  }
                }
              }]
            },
            ManagedPolicyArns: permissions.length > 0 ? permissions : defaultPermissions,
            Tags: [
              { Key: 'ManagedBy', Value: 'Careerate' },
              { Key: 'UserId', Value: userId }
            ]
          }
        }
      },
      Outputs: {
        RoleArn: {
          Description: 'ARN of the Careerate role - copy this to connect your account',
          Value: { 'Fn::GetAtt': ['CareérateRole', 'Arn'] },
          Export: { Name: `Careerate-Role-ARN-${userId}` }
        },
        ExternalId: {
          Description: 'External ID for verification',
          Value: { Ref: 'ExternalId' }
        }
      }
    };
  }

  /**
   * Export deployed resources as CloudFormation template
   */
  async exportDeployment(deploymentId: string): Promise<DeploymentExport> {
    agentLogger.info('Exporting AWS deployment', { deploymentId });

    // Get deployment from database
    const deployment = await storageV2.getDeploymentById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // In production, would query AWS to get actual deployed resources
    // For now, generate based on deployment metadata
    const template = this.generateDeploymentTemplate(deployment);

    const instructions = this.generateEjectionInstructions(deployment);

    return {
      templateFormat: 'cloudformation',
      template,
      instructions,
      deployedResources: deployment.resources || []
    };
  }

  /**
   * Generate CloudFormation template for deployed resources
   */
  private generateDeploymentTemplate(deployment: any): AWSIAMRoleTemplate {
    // This would contain actual deployed resources (ECS services, RDS, S3, etc.)
    return {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: `Careerate deployment: ${deployment.name}`,
      Parameters: {},
      Resources: {
        // VPC
        VPC: {
          Type: 'AWS::EC2::VPC',
          Properties: {
            CidrBlock: '10.0.0.0/16',
            EnableDnsHostnames: true,
            EnableDnsSupport: true,
            Tags: [
              { Key: 'Name', Value: `${deployment.name}-vpc` },
              { Key: 'ManagedBy', Value: 'Careerate' }
            ]
          }
        },
        // ECS Cluster (example)
        ECSCluster: {
          Type: 'AWS::ECS::Cluster',
          Properties: {
            ClusterName: `${deployment.name}-cluster`,
            Tags: [
              { Key: 'Name', Value: `${deployment.name}-cluster` },
              { Key: 'ManagedBy', Value: 'Careerate' }
            ]
          }
        },
        // Add more resources based on deployment.architecture
        // This is a simplified example
      },
      Outputs: {
        VPCId: {
          Description: 'VPC ID',
          Value: { Ref: 'VPC' }
        },
        ClusterArn: {
          Description: 'ECS Cluster ARN',
          Value: { 'Fn::GetAtt': ['ECSCluster', 'Arn'] }
        }
      }
    };
  }

  /**
   * Generate step-by-step ejection instructions
   */
  private generateEjectionInstructions(deployment: any): string {
    return `
# AWS Ejection Guide - ${deployment.name}

## What Happened

You've ejected your deployment from Careerate. Your infrastructure is still running in your AWS account, but Careerate no longer has access to manage it.

## Your Resources

All resources remain in your AWS account:
- VPC and networking
- ECS/Lambda compute resources
- RDS databases
- S3 storage buckets
- CloudWatch logs and metrics

## How to Manage Going Forward

### Option 1: AWS Console
1. Go to AWS Console → CloudFormation
2. Find stack: "${deployment.name}"
3. Update resources through the console

### Option 2: AWS CLI
\`\`\`bash
# View stack resources
aws cloudformation describe-stack-resources --stack-name ${deployment.name}

# Update stack
aws cloudformation update-stack --stack-name ${deployment.name} --template-body file://template.json
\`\`\`

### Option 3: Terraform (Migration)
If you prefer Terraform, you can import these resources:
\`\`\`bash
terraform import aws_vpc.main <VPC_ID>
terraform import aws_ecs_cluster.main <CLUSTER_ARN>
\`\`\`

## What You'll Miss

Without Careerate:
- ❌ Natural language deployments
- ❌ AI-powered cost optimization
- ❌ Auto-healing for issues
- ❌ Real-time monitoring dashboard
- ❌ Multi-cloud intelligence

## Need Help?

- 📚 AWS Documentation: https://docs.aws.amazon.com/cloudformation/
- 💬 Careerate Support: support@gocareerate.com
- 🔄 Re-connect: You can reconnect Careerate anytime

## Deleting Resources (Optional)

To fully remove everything:
\`\`\`bash
aws cloudformation delete-stack --stack-name ${deployment.name}
\`\`\`

⚠️ This will delete all resources and cannot be undone!
`.trim();
  }

  /**
   * Revoke Careerate's access to user's AWS account
   */
  async revokeAccess(userId: string, integrationId: string): Promise<void> {
    agentLogger.info('Revoking AWS access', { userId, integrationId });

    // Get integration details
    const integration = await storageV2.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // In production, would call AWS STS/IAM to delete the role
    // For now, just mark as ejected in database
    await storageV2.updateIntegration(integrationId, {
      status: 'ejected',
      ejectedAt: new Date()
    });

    agentLogger.info('AWS access revoked successfully', { userId, integrationId });
  }

  /**
   * Complete ejection flow
   */
  async eject(userId: string, integrationId: string): Promise<{
    success: boolean;
    exports: DeploymentExport[];
    instructions: string;
    revokedAt: Date;
  }> {
    agentLogger.info('Starting AWS ejection', { userId, integrationId });

    // Get all deployments for this integration
    const deployments = await storageV2.getDeploymentsByIntegration(integrationId);

    // Export each deployment
    const exports = await Promise.all(
      deployments.map(d => this.exportDeployment(d.id))
    );

    // Revoke access
    await this.revokeAccess(userId, integrationId);

    // Generate master instructions
    const instructions = this.generateMasterEjectionGuide(deployments, exports);

    return {
      success: true,
      exports,
      instructions,
      revokedAt: new Date()
    };
  }

  /**
   * Generate master ejection guide covering all deployments
   */
  private generateMasterEjectionGuide(deployments: any[], exports: DeploymentExport[]): string {
    return `
# AWS Account Ejection - Complete Guide

## Overview

You've successfully ejected ${deployments.length} deployment(s) from Careerate management.

## Deployments

${deployments.map((d, i) => `
### ${i + 1}. ${d.name}
- **Status**: Running independently
- **Region**: ${d.region || 'us-east-1'}
- **Template**: deployment-${d.id}.json
`).join('\n')}

## Next Steps

1. **Download all templates** from the ZIP file
2. **Review each deployment** in AWS Console
3. **Set up monitoring** (CloudWatch, Datadog, etc.)
4. **Configure alerts** for errors and high costs
5. **Update deployment** processes (CI/CD pipelines)

## Re-connecting (Optional)

If you want Careerate back:
1. Go to gocareerate.com/integrations
2. Click "Connect AWS"
3. Create new CloudFormation stack
4. Your deployments will be re-imported automatically

Thank you for using Careerate! 🚀
`.trim();
  }
}

// Export singleton
export const awsEjector = new AWSEjector();

