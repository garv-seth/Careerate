/**
 * AWS OAuth Service - Porter-style CloudFormation Stack
 * User connects AWS account by creating a CloudFormation stack that grants Careerate permissions
 */

import { storage } from '../../storage';
import crypto from 'crypto';

interface AWSConnectionResult {
  success: boolean;
  integrationId?: string;
  error?: string;
}

export class AWSCloudFormationOAuth {
  
  /**
   * Generate CloudFormation template for AWS account connection
   * This creates an IAM role with cross-account trust to Careerate
   */
  generateCloudFormationTemplate(userId: string, externalId: string): string {
    const careerateAWSAccountId = process.env.CAREERATE_AWS_ACCOUNT_ID || '123456789012'; // Your AWS account
    
    const template = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: 'Careerate Infrastructure Management - Grants Careerate access to manage infrastructure in your AWS account',
      
      Parameters: {
        ExternalId: {
          Type: 'String',
          Default: externalId,
          Description: 'External ID for secure cross-account access'
        }
      },
      
      Resources: {
        CareerateRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            RoleName: `Careerate-InfrastructureRole-${externalId.substring(0, 8)}`,
            Description: 'Role for Careerate to manage infrastructure deployments',
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: {
                    AWS: `arn:aws:iam::${careerateAWSAccountId}:root`
                  },
                  Action: 'sts:AssumeRole',
                  Condition: {
                    StringEquals: {
                      'sts:ExternalId': externalId
                    }
                  }
                }
              ]
            },
            ManagedPolicyArns: [
              'arn:aws:iam::aws:policy/PowerUserAccess'  // Can deploy but not modify IAM
            ],
            Policies: [
              {
                PolicyName: 'CareerateDeploymentPolicy',
                PolicyDocument: {
                  Version: '2012-10-17',
                  Statement: [
                    {
                      Effect: 'Allow',
                      Action: [
                        'ecs:*',
                        'ecr:*',
                        'ec2:*',
                        'elasticloadbalancing:*',
                        'autoscaling:*',
                        'cloudwatch:*',
                        'logs:*',
                        'rds:*',
                        's3:*',
                        'lambda:*',
                        'apigateway:*',
                        'cloudformation:*',
                        'route53:*',
                        'acm:*',
                        'secretsmanager:*',
                        'ssm:*'
                      ],
                      Resource: '*'
                    },
                    {
                      Effect: 'Allow',
                      Action: [
                        'iam:GetRole',
                        'iam:PassRole',
                        'iam:CreateServiceLinkedRole',
                        'iam:AttachRolePolicy',
                        'iam:PutRolePolicy'
                      ],
                      Resource: '*',
                      Condition: {
                        StringLike: {
                          'iam:PassedToService': [
                            'ecs-tasks.amazonaws.com',
                            'lambda.amazonaws.com',
                            'rds.amazonaws.com'
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            ],
            Tags: [
              {
                Key: 'ManagedBy',
                Value: 'Careerate'
              },
              {
                Key: 'Purpose',
                Value: 'Infrastructure-Deployment'
              }
            ]
          }
        }
      },
      
      Outputs: {
        RoleARN: {
          Description: 'ARN of the IAM role for Careerate',
          Value: { 'Fn::GetAtt': ['CareerateRole', 'Arn'] },
          Export: {
            Name: `Careerate-Role-${externalId.substring(0, 8)}`
          }
        },
        ExternalId: {
          Description: 'External ID for secure access',
          Value: externalId
        },
        AccountId: {
          Description: 'Your AWS Account ID',
          Value: { Ref: 'AWS::AccountId' }
        }
      }
    };
    
    return JSON.stringify(template, null, 2);
  }

  /**
   * Generate AWS Console URL to create the stack
   */
  generateStackCreationURL(userId: string, region: string = 'us-east-1'): {
    url: string;
    externalId: string;
    stackName: string;
  } {
    const externalId = crypto.randomBytes(16).toString('hex');
    const stackName = `Careerate-Infrastructure-${Date.now()}`;
    const template = this.generateCloudFormationTemplate(userId, externalId);
    
    // Encode template for URL
    const templateBody = encodeURIComponent(template);
    
    // AWS Console URL to create stack
    const consoleURL = `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/create/review` +
      `?stackName=${stackName}` +
      `&templateBody=${templateBody}`;
    
    return {
      url: consoleURL,
      externalId,
      stackName
    };
  }

  /**
   * Complete AWS connection after stack is created
   * User provides the Role ARN from stack outputs
   */
  async completeAWSConnection(
    userId: string,
    accountId: string,
    roleARN: string,
    externalId: string,
    region: string
  ): Promise<AWSConnectionResult> {
    try {
      // Validate Role ARN format
      if (!roleARN.startsWith('arn:aws:iam::') || !roleARN.includes(':role/Careerate-')) {
        return {
          success: false,
          error: 'Invalid Role ARN format. Must be a Careerate IAM role.'
        };
      }

      // Extract account ID from ARN to verify
      const arnAccountId = roleARN.split(':')[4];
      if (arnAccountId !== accountId) {
        return {
          success: false,
          error: 'Account ID mismatch in Role ARN'
        };
      }

      // Test connection by assuming the role
      const canConnect = await this.testAssumeRole(roleARN, externalId);
      if (!canConnect) {
        return {
          success: false,
          error: 'Unable to assume role. Verify CloudFormation stack was created successfully.'
        };
      }

      // Create integration in database
      const integration = await storage.createIntegration({
        userId,
        projectId: null,
        name: `AWS Account (${accountId})`,
        type: 'cloud-provider',
        service: 'aws',
        category: 'deployment',
        connectionType: 'cross-account-role',
        status: 'active',
        configuration: {
          accountId,
          region,
          roleARN,
          externalId,
          connectedAt: new Date().toISOString()
        },
        endpoints: {
          console: `https://console.aws.amazon.com`,
          ecs: `https://ecs.${region}.amazonaws.com`,
          ecr: `https://ecr.${region}.amazonaws.com`
        },
        permissions: ['deploy', 'manage', 'monitor', 'scale'],
        rateLimits: {},
        healthCheck: {
          enabled: true,
          interval: 300000, // 5 minutes
          endpoint: 'sts:AssumeRole'
        },
        isEnabled: true,
        autoRotate: false,
        metadata: {
          setupMethod: 'cloudformation',
          stackCreatedAt: new Date().toISOString()
        }
      });

      // Log the connection
      await storage.createIntegrationAuditLog({
        integrationId: integration.id,
        userId,
        action: 'created',
        resourceType: 'integration',
        resourceId: integration.id,
        details: {
          provider: 'aws',
          accountId,
          roleARN,
          method: 'cloudformation'
        },
        risk: 'medium',
        complianceFlags: [],
        metadata: {}
      });

      return {
        success: true,
        integrationId: integration.id
      };

    } catch (error: any) {
      console.error('AWS connection error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect AWS account'
      };
    }
  }

  /**
   * Test if we can assume the IAM role
   */
  private async testAssumeRole(roleARN: string, externalId: string): Promise<boolean> {
    try {
      // In production, this would use AWS STS to assume the role
      // For now, we'll do a simple validation
      
      // TODO: Implement actual AWS STS AssumeRole call
      // const { STSClient, AssumeRoleCommand } = await import('@aws-sdk/client-sts');
      // const client = new STSClient({ region: 'us-east-1' });
      // const response = await client.send(new AssumeRoleCommand({
      //   RoleArn: roleARN,
      //   RoleSessionName: 'careerate-connection-test',
      //   ExternalId: externalId
      // }));
      
      // For now, assume it works if format is correct
      return roleARN.includes('Careerate') && externalId.length > 0;
      
    } catch (error) {
      console.error('Role assumption test failed:', error);
      return false;
    }
  }

  /**
   * Get CloudFormation template for download
   */
  async getTemplateForDownload(userId: string): Promise<{ template: string; externalId: string }> {
    const externalId = crypto.randomBytes(16).toString('hex');
    const template = this.generateCloudFormationTemplate(userId, externalId);
    
    return {
      template,
      externalId
    };
  }

  /**
   * Disconnect AWS account (deletes integration)
   */
  async disconnectAWS(userId: string, integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const integration = await storage.getIntegration(integrationId);
      
      if (!integration || integration.userId !== userId) {
        return { success: false, message: 'Integration not found or unauthorized' };
      }

      if (integration.service !== 'aws') {
        return { success: false, message: 'Not an AWS integration' };
      }

      // Delete integration
      await storage.deleteIntegration(integrationId);

      // Log disconnection
      await storage.createIntegrationAuditLog({
        integrationId,
        userId,
        action: 'deleted',
        resourceType: 'integration',
        resourceId: integrationId,
        details: {
          provider: 'aws',
          accountId: integration.configuration?.accountId
        },
        risk: 'high',
        complianceFlags: [],
        metadata: {}
      });

      return {
        success: true,
        message: 'AWS account disconnected. You can now delete the CloudFormation stack from AWS Console.'
      };

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to disconnect AWS account'
      };
    }
  }
}

export const awsOAuth = new AWSCloudFormationOAuth();

