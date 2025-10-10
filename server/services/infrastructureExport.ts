/**
 * Infrastructure Export & Ejectability Service
 * Allows users to export their infrastructure as IaC (Infrastructure as Code)
 * and eject from Careerate while keeping infrastructure running
 */

import { storage } from '../storage';

export interface InfrastructureExport {
  provider: 'aws' | 'azure' | 'gcp';
  format: 'cloudformation' | 'terraform' | 'bicep' | 'arm';
  template: string;
  parameters?: Record<string, any>;
  instructions: string;
}

export class InfrastructureExportService {
  
  /**
   * Export deployment as Infrastructure as Code
   */
  async exportDeployment(deploymentId: string): Promise<InfrastructureExport> {
    const deployment = await storage.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const provider = deployment.provider || 'azure';
    
    switch (provider) {
      case 'aws':
        return this.exportAWSDeployment(deployment);
      case 'azure':
        return this.exportAzureDeployment(deployment);
      case 'gcp':
        return this.exportGCPDeployment(deployment);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Export AWS deployment as CloudFormation
   */
  private exportAWSDeployment(deployment: any): InfrastructureExport {
    const template = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: `Careerate Deployment: ${deployment.projectId}`,
      
      Parameters: {
        ImageTag: {
          Type: 'String',
          Default: 'latest',
          Description: 'Docker image tag'
        }
      },

      Resources: {
        // ECS Cluster
        ECSCluster: {
          Type: 'AWS::ECS::Cluster',
          Properties: {
            ClusterName: `careerate-${deployment.projectId}`,
            CapacityProviders: ['FARGATE', 'FARGATE_SPOT']
          }
        },

        // Task Definition
        TaskDefinition: {
          Type: 'AWS::ECS::TaskDefinition',
          Properties: {
            Family: `careerate-${deployment.projectId}`,
            NetworkMode: 'awsvpc',
            RequiresCompatibilities: ['FARGATE'],
            Cpu: '256',
            Memory: '512',
            ContainerDefinitions: [
              {
                Name: deployment.appName || 'app',
                Image: deployment.containerImage || 'nginx:latest',
                PortMappings: [
                  {
                    ContainerPort: deployment.port || 80,
                    Protocol: 'tcp'
                  }
                ],
                Environment: Object.entries(deployment.envVars || {}).map(([name, value]) => ({
                  Name: name,
                  Value: value
                })),
                LogConfiguration: {
                  LogDriver: 'awslogs',
                  Options: {
                    'awslogs-group': { Ref: 'LogGroup' },
                    'awslogs-region': { Ref: 'AWS::Region' },
                    'awslogs-stream-prefix': 'ecs'
                  }
                }
              }
            ]
          }
        },

        // Log Group
        LogGroup: {
          Type: 'AWS::Logs::LogGroup',
          Properties: {
            LogGroupName: `/ecs/careerate-${deployment.projectId}`,
            RetentionInDays: 7
          }
        },

        // ECS Service
        Service: {
          Type: 'AWS::ECS::Service',
          Properties: {
            ServiceName: `careerate-${deployment.projectId}`,
            Cluster: { Ref: 'ECSCluster' },
            TaskDefinition: { Ref: 'TaskDefinition' },
            DesiredCount: 1,
            LaunchType: 'FARGATE',
            NetworkConfiguration: {
              AwsvpcConfiguration: {
                AssignPublicIp: 'ENABLED',
                Subnets: ['REPLACE_WITH_YOUR_SUBNET_IDS'],
                SecurityGroups: [{ Ref: 'SecurityGroup' }]
              }
            }
          }
        },

        // Security Group
        SecurityGroup: {
          Type: 'AWS::EC2::SecurityGroup',
          Properties: {
            GroupDescription: `Careerate ${deployment.projectId} security group`,
            VpcId: 'REPLACE_WITH_YOUR_VPC_ID',
            SecurityGroupIngress: [
              {
                IpProtocol: 'tcp',
                FromPort: deployment.port || 80,
                ToPort: deployment.port || 80,
                CidrIp: '0.0.0.0/0'
              }
            ]
          }
        }
      },

      Outputs: {
        ClusterName: {
          Description: 'ECS Cluster Name',
          Value: { Ref: 'ECSCluster' }
        },
        ServiceName: {
          Description: 'ECS Service Name',
          Value: { 'Fn::GetAtt': ['Service', 'Name'] }
        }
      }
    };

    const instructions = `
# AWS CloudFormation Deployment Instructions

## Prerequisites
1. AWS CLI installed and configured
2. VPC and Subnets created in your AWS account
3. Docker image pushed to ECR or Docker Hub

## Steps to Deploy Manually

1. **Update the template:**
   - Replace 'REPLACE_WITH_YOUR_VPC_ID' with your VPC ID
   - Replace 'REPLACE_WITH_YOUR_SUBNET_IDS' with your subnet IDs

2. **Create the stack:**
   \`\`\`bash
   aws cloudformation create-stack \\
     --stack-name careerate-${deployment.projectId} \\
     --template-body file://template.json \\
     --capabilities CAPABILITY_IAM
   \`\`\`

3. **Monitor the deployment:**
   \`\`\`bash
   aws cloudformation describe-stacks \\
     --stack-name careerate-${deployment.projectId}
   \`\`\`

4. **To update the deployment:**
   \`\`\`bash
   aws cloudformation update-stack \\
     --stack-name careerate-${deployment.projectId} \\
     --template-body file://template.json
   \`\`\`

## Ongoing Management
- Use AWS Console or CLI to manage the ECS service
- Update task definitions to deploy new versions
- Configure auto-scaling if needed
- Set up CloudWatch alarms for monitoring

## Notes
- Careerate will no longer manage this deployment
- You are responsible for updates, scaling, and monitoring
- Infrastructure costs will be billed directly to your AWS account
`;

    return {
      provider: 'aws',
      format: 'cloudformation',
      template: JSON.stringify(template, null, 2),
      instructions
    };
  }

  /**
   * Export Azure deployment as Bicep/ARM
   */
  private exportAzureDeployment(deployment: any): InfrastructureExport {
    const bicepTemplate = `
// Careerate Deployment: ${deployment.projectId}
param location string = resourceGroup().location
param containerAppName string = '${deployment.appName || 'careerate-app'}'
param containerImage string = '${deployment.containerImage || 'nginx:latest'}'
param containerPort int = ${deployment.port || 80}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'careerate-env-\${uniqueString(resourceGroup().id)}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'careerate-logs-\${uniqueString(resourceGroup().id)}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: containerPort
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
${Object.entries(deployment.envVars || {}).map(([key, value]) => 
  `            {\n              name: '${key}'\n              value: '${value}'\n            }`
).join('\n')}
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output containerAppFQDN string = containerApp.properties.configuration.ingress.fqdn
output containerAppUrl string = 'https://\${containerApp.properties.configuration.ingress.fqdn}'
`;

    const instructions = `
# Azure Bicep Deployment Instructions

## Prerequisites
1. Azure CLI installed and configured
2. Resource Group created
3. Container image available (ACR or Docker Hub)

## Steps to Deploy Manually

1. **Save the template as 'main.bicep'**

2. **Deploy the template:**
   \`\`\`bash
   az deployment group create \\
     --resource-group <your-resource-group> \\
     --template-file main.bicep \\
     --parameters containerAppName='${deployment.appName}'
   \`\`\`

3. **Get the deployment URL:**
   \`\`\`bash
   az deployment group show \\
     --resource-group <your-resource-group> \\
     --name main \\
     --query properties.outputs.containerAppUrl.value
   \`\`\`

4. **To update the deployment:**
   - Modify the Bicep file
   - Run the deployment command again

## Ongoing Management
- Use Azure Portal or CLI to manage the Container App
- Update container image to deploy new versions
- Configure scaling rules as needed
- Monitor via Log Analytics

## Notes
- Careerate will no longer manage this deployment
- You are responsible for updates and monitoring
- Costs will be billed to your Azure subscription
`;

    return {
      provider: 'azure',
      format: 'bicep',
      template: bicepTemplate,
      instructions
    };
  }

  /**
   * Export GCP deployment as Terraform
   */
  private exportGCPDeployment(deployment: any): InfrastructureExport {
    const terraformTemplate = `
# Careerate Deployment: ${deployment.projectId}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "container_image" {
  description = "Container image to deploy"
  type        = string
  default     = "${deployment.containerImage || 'nginx:latest'}"
}

resource "google_cloud_run_service" "app" {
  name     = "${deployment.appName || 'careerate-app'}"
  location = var.region

  template {
    spec {
      containers {
        image = var.container_image
        
        ports {
          container_port = ${deployment.port || 80}
        }

        ${Object.entries(deployment.envVars || {}).map(([key, value]) => 
          `env {\n          name  = "${key}"\n          value = "${value}"\n        }`
        ).join('\n\n        ')}

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  description = "URL of the deployed service"
  value       = google_cloud_run_service.app.status[0].url
}
`;

    const instructions = `
# GCP Terraform Deployment Instructions

## Prerequisites
1. Terraform installed
2. Google Cloud SDK installed and configured
3. Container image pushed to GCR or Artifact Registry

## Steps to Deploy Manually

1. **Initialize Terraform:**
   \`\`\`bash
   terraform init
   \`\`\`

2. **Review the plan:**
   \`\`\`bash
   terraform plan -var="project_id=YOUR_PROJECT_ID"
   \`\`\`

3. **Apply the configuration:**
   \`\`\`bash
   terraform apply -var="project_id=YOUR_PROJECT_ID"
   \`\`\`

4. **Get the service URL:**
   \`\`\`bash
   terraform output service_url
   \`\`\`

5. **To update the deployment:**
   - Modify the Terraform files
   - Run \`terraform apply\` again

## Ongoing Management
- Use \`terraform\` commands or GCP Console to manage
- Update the \`container_image\` variable to deploy new versions
- Configure auto-scaling via Terraform variables
- Monitor via Cloud Monitoring

## Notes
- Careerate will no longer manage this deployment
- You are responsible for all infrastructure management
- Costs will be billed to your GCP project
`;

    return {
      provider: 'gcp',
      format: 'terraform',
      template: terraformTemplate,
      instructions
    };
  }

  /**
   * Eject a cloud account (remove Careerate's access)
   */
  async ejectCloudAccount(userId: string, integrationId: string): Promise<{
    success: boolean;
    exports: InfrastructureExport[];
    instructions: string;
  }> {
    const integration = await storage.getIntegration(integrationId);
    
    if (!integration || integration.userId !== userId) {
      throw new Error('Integration not found or unauthorized');
    }

    // Get all deployments using this cloud account
    const deployments = await storage.getProjectsForUser(userId);
    const exports: InfrastructureExport[] = [];

    // Export each deployment
    for (const deployment of deployments) {
      try {
        const exported = await this.exportDeployment(deployment.id);
        exports.push(exported);
      } catch (error) {
        console.error(`Failed to export deployment ${deployment.id}:`, error);
      }
    }

    // Create ejection package
    const ejectionInstructions = `
# Careerate Ejection Complete

You have successfully ejected from Careerate. Your infrastructure will continue running in your cloud account.

## What Happened
- Careerate's access to your cloud account has been revoked
- All infrastructure remains running in YOUR cloud account
- You now have full control and responsibility

## Next Steps

1. **Review the exported templates** for each deployment
2. **Save these templates** to your version control
3. **Remove Careerate's IAM roles/permissions** from your cloud console:
   ${integration.service === 'aws' ? '- Delete the CloudFormation stack: Careerate-Infrastructure-*' : ''}
   ${integration.service === 'azure' ? '- Revoke the OAuth consent in Azure AD' : ''}
   ${integration.service === 'gcp' ? '- Remove the service account or revoke OAuth access' : ''}

4. **Set up your own deployment pipeline** using the exported IaC templates
5. **Configure monitoring and alerting** in your cloud console

## What You're Now Responsible For
- ✓ Infrastructure updates and deployments
- ✓ Scaling and performance optimization
- ✓ Security patches and updates
- ✓ Monitoring and incident response
- ✓ Cost optimization
- ✓ Backup and disaster recovery

## Support
If you need help with the transition, contact support@careerate.com

Your infrastructure is safe and running. Good luck!
`;

    // Mark integration as ejected (but don't delete - keep audit trail)
    await storage.updateIntegration(integrationId, {
      status: 'ejected',
      isEnabled: false,
      metadata: {
        ...integration.metadata,
        ejectedAt: new Date().toISOString(),
        ejectedBy: userId
      }
    });

    // Log the ejection
    await storage.createIntegrationAuditLog({
      integrationId,
      userId,
      action: 'ejected',
      resourceType: 'integration',
      resourceId: integrationId,
      details: {
        provider: integration.service,
        deploymentsExported: exports.length
      },
      risk: 'high',
      complianceFlags: ['user-initiated-ejection'],
      metadata: {}
    });

    return {
      success: true,
      exports,
      instructions: ejectionInstructions
    };
  }
}

export const infrastructureExport = new InfrastructureExportService();

