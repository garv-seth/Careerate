# Porter.run Infrastructure Patterns - Ejectable Infrastructure Guide

**Date**: October 11, 2025  
**Purpose**: Document Porter.run's approach to ejectable infrastructure for Careerate implementation  
**Status**: Complete

---

## Overview

Porter.run pioneered the **"Deploy in Your Cloud"** model, allowing users to:
1. Keep full ownership of infrastructure
2. Pay cloud providers directly (no markup)
3. Eject from Porter anytime without losing infrastructure
4. Meet compliance and security requirements (data stays in user's account)

This document details their technical implementation and how Careerate will adapt/improve it.

---

## AWS Implementation (Porter's Approach)

### Phase 1: Connection Setup

**Step 1: User Initiates Connection**
- User clicks "Connect AWS" in Porter dashboard
- Porter generates a unique `ExternalId` (cryptographic nonce for security)

**Step 2: CloudFormation Template Generation**
Porter dynamically generates a CloudFormation template:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Porter Cross-Account Access Role'

Parameters:
  PorterAccountId:
    Type: String
    Default: '123456789012'  # Porter's AWS account ID
    Description: 'Porter AWS account that will assume this role'
  ExternalId:
    Type: String
    Description: 'Unique external ID for secure cross-account access'

Resources:
  PorterIAMRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub 'Porter-${AWS::StackName}'
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::${PorterAccountId}:root'
            Action: 'sts:AssumeRole'
            Condition:
              StringEquals:
                'sts:ExternalId': !Ref ExternalId
      ManagedPolicyArns:
        - 'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess'
        - 'arn:aws:iam::aws:policy/AmazonEKSClusterPolicy'
        - 'arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy'
        - 'arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy'
      Policies:
        - PolicyName: PorterDeploymentPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - 'ec2:*'
                  - 'elasticloadbalancing:*'
                  - 'autoscaling:*'
                  - 'cloudformation:*'
                  - 'rds:*'
                  - 's3:*'
                  - 'logs:*'
                  - 'cloudwatch:*'
                  - 'secretsmanager:*'
                  - 'kms:*'
                Resource: '*'

Outputs:
  RoleArn:
    Description: 'ARN of the Porter IAM Role'
    Value: !GetAtt PorterIAMRole.Arn
    Export:
      Name: PorterRoleArn
```

**Step 3: User Creates Stack**
- User downloads template or clicks "Launch Stack" (deep link to AWS Console)
- CloudFormation stack is created in user's AWS account
- User provides ExternalId parameter

**Step 4: Porter Stores Credentials**
- Porter receives Role ARN from user (or auto-detects via API)
- Stores: `{ userId, roleArn, externalId, region, connectedAt }`
- Encrypted at rest in Porter's database

### Phase 2: Deployment

**Step 1: Assume Role**
```typescript
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

async function assumeUserRole(roleArn: string, externalId: string) {
  const stsClient = new STSClient({ region: 'us-east-1' });
  
  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: 'PorterDeploymentSession',
    ExternalId: externalId,
    DurationSeconds: 3600  // 1 hour
  });
  
  const response = await stsClient.send(command);
  
  return {
    accessKeyId: response.Credentials!.AccessKeyId!,
    secretAccessKey: response.Credentials!.SecretAccessKey!,
    sessionToken: response.Credentials!.SessionToken!
  };
}
```

**Step 2: Provision Resources**
Porter uses temporary credentials to create resources in user's account:
- EKS cluster for Kubernetes
- ECR repository for Docker images
- RDS for databases
- S3 for storage
- Load balancers, security groups, etc.

**Step 3: Deploy Application**
- Build Docker image
- Push to user's ECR
- Deploy to user's EKS cluster
- Configure load balancer

### Phase 3: Ejection

**Step 1: Export Infrastructure**
```typescript
async function exportInfrastructure(userId: string) {
  const deployments = await db.getDeploymentsByUser(userId);
  const exportPackage: InfraExport = {
    cloudFormationTemplates: [],
    kubernetesManifests: [],
    configuration: {}
  };
  
  for (const deployment of deployments) {
    // Export CloudFormation
    const cfnTemplate = await generateCloudFormationFromDeployment(deployment);
    exportPackage.cloudFormationTemplates.push({
      name: `${deployment.name}-infrastructure.yaml`,
      content: cfnTemplate
    });
    
    // Export Kubernetes manifests
    const k8sManifests = await exportKubernetesManifests(deployment.clusterId);
    exportPackage.kubernetesManifests.push({
      name: `${deployment.name}-k8s-manifests.yaml`,
      content: k8sManifests
    });
    
    // Export environment variables
    exportPackage.configuration[deployment.name] = {
      environment: deployment.envVars,
      scaling: deployment.scalingPolicy,
      domains: deployment.customDomains
    };
  }
  
  // Create ZIP
  const zipBuffer = await createZip(exportPackage);
  return zipBuffer;
}
```

**Step 2: Revoke Access**
```typescript
async function ejectUser(userId: string) {
  // 1. Generate export package
  const exportZip = await exportInfrastructure(userId);
  
  // 2. Send download link to user
  await sendEjectionEmail(userId, exportZip);
  
  // 3. Delete IAM role (user does this manually in AWS Console)
  // We just provide instructions
  
  // 4. Mark deployments as "ejected" in DB
  await db.markDeploymentsAsEjected(userId);
  
  // 5. Stop monitoring and management
  await stopAutomation(userId);
}
```

**Step 3: User Retains Infrastructure**
- All EC2, EKS, RDS, S3 resources remain running
- User now manages via AWS Console, CLI, or exported templates
- Billing continues through AWS (no change)

---

## Careerate's Implementation (Multi-Cloud)

### AWS (Enhanced Porter Model)

**Improvements**:
1. **More Granular Permissions**: Instead of broad `ec2:*`, use specific actions
2. **Multiple Roles**: Separate roles for deployment vs monitoring
3. **Resource Tagging**: Tag all resources with `Careerate:UserId` for easy identification
4. **Stack Exports**: Export not just templates, but live resource configurations

**Implementation**:

```typescript
// server/cloud/aws/cloudformation.ts

export function generateCareérateIAMRole(userId: string, externalId: string): CloudFormationTemplate {
  return {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: 'Careerate AI DevOps Platform - AWS Access Role',
    
    Parameters: {
      CareérateAccountId: {
        Type: 'String',
        Default: process.env.CAREERATE_AWS_ACCOUNT_ID,
        Description: 'Careerate AWS account for cross-account access'
      },
      ExternalId: {
        Type: 'String',
        Default: externalId,
        Description: 'Unique security token'
      }
    },
    
    Resources: {
      // Deployment Role (full permissions)
      CareérateDeploymentRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: `Careerate-Deploy-${userId}`,
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: { AWS: { Ref: 'CareérateAccountId' } },
              Action: 'sts:AssumeRole',
              Condition: { StringEquals: { 'sts:ExternalId': { Ref: 'ExternalId' } } }
            }]
          },
          Policies: [{
            PolicyName: 'CareérateDeploymentPolicy',
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                // ECS
                { Effect: 'Allow', Action: ['ecs:*'], Resource: '*' },
                // Lambda
                { Effect: 'Allow', Action: ['lambda:*'], Resource: '*' },
                // RDS
                { Effect: 'Allow', Action: ['rds:*'], Resource: '*' },
                // S3
                { Effect: 'Allow', Action: ['s3:*'], Resource: '*' },
                // CloudWatch
                { Effect: 'Allow', Action: ['cloudwatch:*', 'logs:*'], Resource: '*' },
                // Secrets Manager
                { Effect: 'Allow', Action: ['secretsmanager:*'], Resource: '*' },
                // VPC (for networking)
                { Effect: 'Allow', Action: ['ec2:*Vpc*', 'ec2:*Subnet*', 'ec2:*SecurityGroup*'], Resource: '*' },
                // CloudFormation (for stack management)
                { Effect: 'Allow', Action: ['cloudformation:*'], Resource: '*' }
              ]
            }
          }],
          Tags: [
            { Key: 'ManagedBy', Value: 'Careerate' },
            { Key: 'UserId', Value: userId }
          ]
        }
      },
      
      // Monitoring Role (read-only)
      CareérateMonitoringRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: `Careerate-Monitor-${userId}`,
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: { AWS: { Ref: 'CareérateAccountId' } },
              Action: 'sts:AssumeRole',
              Condition: { StringEquals: { 'sts:ExternalId': { Ref: 'ExternalId' } } }
            }]
          },
          ManagedPolicyArns: [
            'arn:aws:iam::aws:policy/ReadOnlyAccess'
          ]
        }
      }
    },
    
    Outputs: {
      DeploymentRoleArn: {
        Description: 'ARN for Careerate deployment operations',
        Value: { 'Fn::GetAtt': ['CareérateDeploymentRole', 'Arn'] }
      },
      MonitoringRoleArn: {
        Description: 'ARN for Careerate monitoring (read-only)',
        Value: { 'Fn::GetAtt': ['CareérateMonitoringRole', 'Arn'] }
      }
    }
  };
}

export async function exportDeploymentAsCloudFormation(deploymentId: string) {
  const deployment = await storage.getDeployment(deploymentId);
  
  // Use AWS SDK to describe live resources
  const ecsClient = new ECSClient({ /* credentials */ });
  const rdsClient = new RDSClient({ /* credentials */ });
  
  // Build CloudFormation template from live state
  const template: CloudFormationTemplate = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: `Exported infrastructure for ${deployment.name}`,
    Resources: {}
  };
  
  // Export ECS service
  if (deployment.resources.ecsService) {
    const serviceDesc = await ecsClient.send(new DescribeServicesCommand({
      cluster: deployment.resources.clusterName,
      services: [deployment.resources.ecsService]
    }));
    
    template.Resources.ECSService = {
      Type: 'AWS::ECS::Service',
      Properties: {
        ServiceName: deployment.resources.ecsService,
        Cluster: deployment.resources.clusterName,
        DesiredCount: serviceDesc.services![0].desiredCount,
        // ... full configuration
      }
    };
  }
  
  // Export RDS instance
  if (deployment.resources.rdsInstance) {
    const dbDesc = await rdsClient.send(new DescribeDBInstancesCommand({
      DBInstanceIdentifier: deployment.resources.rdsInstance
    }));
    
    template.Resources.RDSInstance = {
      Type: 'AWS::RDS::DBInstance',
      Properties: {
        DBInstanceIdentifier: deployment.resources.rdsInstance,
        Engine: dbDesc.DBInstances![0].Engine,
        DBInstanceClass: dbDesc.DBInstances![0].DBInstanceClass,
        AllocatedStorage: dbDesc.DBInstances![0].AllocatedStorage,
        // ... full configuration
      }
    };
  }
  
  return yaml.stringify(template);
}
```

---

### Azure (Service Principal Model)

**Approach**: Instead of cross-account roles, use Azure Service Principals with role assignments.

**Implementation**:

```typescript
// server/cloud/azure/service-principals.ts

import { ClientSecretCredential } from '@azure/identity';
import { GraphServiceClient } from '@microsoft/microsoft-graph-client';

export async function createCareérateServicePrincipal(userId: string, subscriptionId: string) {
  // This happens via OAuth flow where user grants permissions
  
  // 1. User authenticates with Azure AD
  const authUrl = `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?
    client_id=${process.env.AZURE_CLIENT_ID}
    &response_type=code
    &redirect_uri=${process.env.AZURE_REDIRECT_URI}
    &scope=https://management.azure.com/.default
    &state=${userId}`;
  
  // 2. After user consents, we receive a code
  // 3. Exchange code for Service Principal credentials
  
  // 4. Assign roles to Service Principal
  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  );
  
  // 5. Grant "Contributor" role on specific resource group
  await assignRole(subscriptionId, resourceGroupName, servicePrincipalId, 'Contributor');
  
  // 6. Store credentials encrypted
  await storage.saveAzureConnection({
    userId,
    subscriptionId,
    tenantId,
    clientId,
    clientSecret: await encrypt(clientSecret),
    resourceGroup: `careerate-${userId}`
  });
}

export async function exportDeploymentAsARMTemplate(deploymentId: string) {
  const deployment = await storage.getDeployment(deploymentId);
  
  const template = {
    $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
    contentVersion: '1.0.0.0',
    parameters: {},
    resources: []
  };
  
  // Export Container App
  if (deployment.resources.containerApp) {
    template.resources.push({
      type: 'Microsoft.App/containerApps',
      apiVersion: '2023-05-01',
      name: deployment.resources.containerApp,
      location: deployment.region,
      properties: {
        // ... full configuration from live resource
      }
    });
  }
  
  // Export PostgreSQL
  if (deployment.resources.postgresServer) {
    template.resources.push({
      type: 'Microsoft.DBforPostgreSQL/flexibleServers',
      apiVersion: '2022-12-01',
      name: deployment.resources.postgresServer,
      location: deployment.region,
      properties: {
        // ... full configuration
      }
    });
  }
  
  return JSON.stringify(template, null, 2);
}

export async function ejectAzureConnection(userId: string) {
  const connection = await storage.getAzureConnection(userId);
  
  // 1. Export all ARM templates
  const deployments = await storage.getDeploymentsByProvider(userId, 'azure');
  const exports = await Promise.all(
    deployments.map(d => exportDeploymentAsARMTemplate(d.id))
  );
  
  // 2. Create export package
  const exportZip = await createZip({
    'README.md': generateEjectionGuide('azure'),
    ...exports.reduce((acc, template, idx) => {
      acc[`deployment-${idx + 1}.json`] = template;
      return acc;
    }, {} as Record<string, string>)
  });
  
  // 3. Revoke Service Principal (user does this in Azure Portal)
  // We provide instructions
  
  // 4. Delete stored credentials
  await storage.deleteAzureConnection(userId);
  
  return exportZip;
}
```

---

### GCP (Service Account Model)

**Approach**: Use Service Account with IAM roles.

**Implementation**:

```typescript
// server/cloud/gcp/service-accounts.ts

import { GoogleAuth } from 'google-auth-library';

export async function connectGCPAccount(userId: string, projectId: string) {
  // Option 1: OAuth flow (preferred)
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
    client_id=${process.env.GCP_CLIENT_ID}
    &redirect_uri=${process.env.GCP_REDIRECT_URI}
    &response_type=code
    &scope=https://www.googleapis.com/auth/cloud-platform
    &state=${userId}`;
  
  // Option 2: Service Account JSON upload (alternative)
  // User downloads SA JSON from GCP Console and uploads to Careerate
  
  // After connection, store encrypted credentials
  await storage.saveGCPConnection({
    userId,
    projectId,
    serviceAccountKey: await encrypt(serviceAccountJSON)
  });
}

export async function exportDeploymentAsTerraform(deploymentId: string) {
  const deployment = await storage.getDeployment(deploymentId);
  
  let terraform = '';
  
  // Cloud Run service
  if (deployment.resources.cloudRunService) {
    terraform += `
resource "google_cloud_run_service" "${deployment.name}" {
  name     = "${deployment.resources.cloudRunService}"
  location = "${deployment.region}"

  template {
    spec {
      containers {
        image = "${deployment.image}"
        resources {
          limits = {
            cpu    = "${deployment.resources.cpu}"
            memory = "${deployment.resources.memory}"
          }
        }
      }
    }
  }
}
`;
  }
  
  // Cloud SQL
  if (deployment.resources.cloudSQL) {
    terraform += `
resource "google_sql_database_instance" "${deployment.name}_db" {
  name             = "${deployment.resources.cloudSQL}"
  database_version = "POSTGRES_15"
  region           = "${deployment.region}"

  settings {
    tier = "${deployment.resources.dbTier}"
  }
}
`;
  }
  
  return terraform;
}
```

---

## Ejection User Experience

### Before Ejection (Warning Modal)

```typescript
<Dialog>
  <DialogTitle>Eject from Careerate?</DialogTitle>
  <DialogDescription>
    <p>This will:</p>
    <ul>
      <li>✅ Export all infrastructure as code (CloudFormation/ARM/Terraform)</li>
      <li>✅ Your apps will keep running (no downtime)</li>
      <li>❌ Revoke Careerate's access to your cloud account</li>
      <li>❌ Stop AI monitoring and auto-healing</li>
      <li>❌ Stop cost optimization suggestions</li>
      <li>❌ No more natural language deployments</li>
    </ul>
    <p className="font-bold mt-4">
      You'll need to manage infrastructure manually (AWS Console, Azure Portal, gcloud CLI, etc.)
    </p>
    <p className="text-muted-foreground mt-2">
      Tip: You can keep Careerate monitoring without deployment access. <a href="#">Learn more</a>
    </p>
  </DialogDescription>
  <DialogActions>
    <Button variant="outline" onClick={cancel}>Cancel</Button>
    <Button variant="destructive" onClick={initiateEjection}>
      Yes, Eject My Infrastructure
    </Button>
  </DialogActions>
</Dialog>
```

### Ejection Flow

1. **User Confirms**: Clicks "Yes, Eject"
2. **Export Generation**: Agent generates IaC templates (30-60 seconds)
3. **Download Prompt**: "Download your infrastructure templates" (ZIP file)
4. **Revocation Instructions**:
   - AWS: "Delete the CloudFormation stack named 'Careerate-[userId]'"
   - Azure: "Remove Service Principal from your subscriptions"
   - GCP: "Delete the Service Account 'careerate-[userId]@...'"
5. **Confirmation**: "Ejection complete. Your infrastructure is still running."

### Post-Ejection

**What Users Get**:
- Complete IaC templates for all deployments
- Configuration files (environment variables, scaling policies)
- Management guide (how to update, scale, monitor manually)
- Migration checklist (setup monitoring, logging, alerting)

**What Users Lose**:
- Natural language deployments ("deploy to production")
- AI cost optimization (potential cost increase)
- Auto-healing (need PagerDuty + manual intervention)
- One-click rollbacks (need to do manually)
- Real-time cost tracking in Careerate UI

**Retention Strategy**:
- Emphasize what they'll miss: "Managing this manually will take 10+ hours/week"
- Offer "Monitoring-Only" mode: Keep Careerate for observability, but no deployment access
- Send re-engagement emails: "Miss Careerate? Reconnect anytime"

---

## Security Considerations

### ExternalId (AWS)
- Prevents "confused deputy" problem
- Cryptographically random, never reused
- Stored encrypted with user record

### Least Privilege
- Start with minimal permissions, request more as needed
- Separate roles for deployment vs monitoring vs cost analysis

### Audit Logs
- Log every `AssumeRole` call
- Track all resource creation/modification
- Provide audit export to users

### Credential Rotation
- Service Principal secrets rotated every 90 days (Azure)
- Service Account keys rotated every 90 days (GCP)
- IAM roles don't need rotation (use temporary STS credentials)

---

## Careerate's Improvements Over Porter

1. **Multi-Cloud**: AWS, Azure, GCP (Porter is AWS-only)
2. **Smarter Export**: Export live configurations, not just templates
3. **Gradual Ejection**: Option to keep monitoring after ejection
4. **AI Assistance**: Agent helps with ejection process, suggests next steps
5. **Cost Tracking**: Show what users will pay without Careerate's optimizations
6. **Re-onboarding**: Easy to reconnect after ejection

---

## Implementation Checklist

- [ ] AWS CloudFormation generator
- [ ] Azure ARM template generator
- [ ] GCP Terraform generator
- [ ] STS AssumeRole implementation
- [ ] Service Principal OAuth flow
- [ ] Service Account JSON upload
- [ ] Live resource export (describe resources, convert to IaC)
- [ ] Ejection API endpoints
- [ ] Ejection UI (warning modal, download flow)
- [ ] Post-ejection guide generation
- [ ] Audit logging for all cloud operations
- [ ] Credential encryption and rotation
- [ ] Re-onboarding flow (reconnect after ejection)

---

## Conclusion

Porter.run's ejectable infrastructure model is brilliant for enterprise trust and compliance. Careerate will:
1. **Adopt** the same cross-account IAM role approach (AWS)
2. **Extend** to Azure (Service Principals) and GCP (Service Accounts)
3. **Improve** with AI-assisted ejection, multi-cloud, and gradual offboarding

**Key Insight**: Ejectability is a FEATURE, not a weakness. It builds trust, wins enterprise deals, and actually reduces churn (users feel safe, so they stay longer).

**Competitive Advantage**: We're the only AI-powered platform with Porter-style ejectability across multiple clouds.

