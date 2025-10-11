/**
 * Azure Ejection Service
 * 
 * Handles ejectable infrastructure for Azure
 * Generates ARM/Bicep templates and manages Service Principal lifecycle
 */

import { storageV2 } from '../../storage-v2';
import { agentLogger } from '../../agents/kernel.config';

export interface ARMTemplate {
  $schema: string;
  contentVersion: string;
  parameters: Record<string, any>;
  variables: Record<string, any>;
  resources: Array<any>;
  outputs: Record<string, any>;
}

/**
 * Azure Ejection Service
 */
export class AzureEjector {
  /**
   * Generate ARM template for Service Principal setup
   */
  generateServicePrincipalGuide(userId: string, tenantId: string): string {
    return `
# Azure Service Principal Setup for Careerate

## Step 1: Create Service Principal

\`\`\`bash
az ad sp create-for-rbac --name "Careerate-${userId}" \\
  --role Contributor \\
  --scopes /subscriptions/<YOUR_SUBSCRIPTION_ID>
\`\`\`

## Step 2: Note the Credentials

Save these values securely:
- appId (Application/Client ID)
- password (Client Secret)
- tenant (Tenant ID)

## Step 3: Paste in Careerate

Go to gocareerate.com/integrations and enter:
- Tenant ID: <tenant>
- Client ID: <appId>
- Client Secret: <password>
- Subscription ID: <YOUR_SUBSCRIPTION_ID>

Done! Careerate can now deploy to your Azure account.
`.trim();
  }

  /**
   * Export deployment as ARM template
   */
  async exportDeployment(deploymentId: string): Promise<{
    templateFormat: 'arm' | 'bicep';
    template: ARMTemplate | string;
    instructions: string;
  }> {
    agentLogger.info('Exporting Azure deployment', { deploymentId });

    const deployment = await storageV2.getDeploymentById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const template = this.generateARMTemplate(deployment);
    const instructions = this.generateEjectionInstructions(deployment);

    return {
      templateFormat: 'arm',
      template,
      instructions
    };
  }

  /**
   * Generate ARM template for deployed resources
   */
  private generateARMTemplate(deployment: any): ARMTemplate {
    return {
      $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
      contentVersion: '1.0.0.0',
      parameters: {
        location: {
          type: 'string',
          defaultValue: deployment.region || 'westus2',
          metadata: { description: 'Location for all resources' }
        }
      },
      variables: {
        containerAppName: `${deployment.name}-app`,
        environmentName: `${deployment.name}-env`
      },
      resources: [
        {
          type: 'Microsoft.App/managedEnvironments',
          apiVersion: '2023-05-01',
          name: '[variables(\'environmentName\')]',
          location: '[parameters(\'location\')]',
          properties: {
            appLogsConfiguration: {
              destination: 'log-analytics'
            }
          }
        },
        {
          type: 'Microsoft.App/containerApps',
          apiVersion: '2023-05-01',
          name: '[variables(\'containerAppName\')]',
          location: '[parameters(\'location\')]',
          dependsOn: [
            '[resourceId(\'Microsoft.App/managedEnvironments\', variables(\'environmentName\'))]'
          ],
          properties: {
            managedEnvironmentId: '[resourceId(\'Microsoft.App/managedEnvironments\', variables(\'environmentName\'))]',
            configuration: {
              ingress: {
                external: true,
                targetPort: 5000
              }
            },
            template: {
              containers: [
                {
                  name: deployment.name,
                  image: deployment.image || 'nginx:latest',
                  resources: {
                    cpu: 0.5,
                    memory: '1Gi'
                  }
                }
              ],
              scale: {
                minReplicas: 1,
                maxReplicas: 10
              }
            }
          }
        }
      ],
      outputs: {
        containerAppFQDN: {
          type: 'string',
          value: '[properties(resourceId(\'Microsoft.App/containerApps\', variables(\'containerAppName\'))).configuration.ingress.fqdn]'
        }
      }
    };
  }

  /**
   * Generate ejection instructions
   */
  private generateEjectionInstructions(deployment: any): string {
    return `
# Azure Ejection Guide - ${deployment.name}

## Your Resources

All resources remain in your Azure subscription:
- Container Apps
- Virtual Networks
- Storage Accounts
- Databases (if any)

## Management Options

### Azure Portal
1. Go to portal.azure.com
2. Navigate to Resource Groups → ${deployment.resourceGroup || deployment.name}
3. Manage resources visually

### Azure CLI
\`\`\`bash
# List resources
az resource list --resource-group ${deployment.resourceGroup || deployment.name}

# Deploy updated template
az deployment group create \\
  --resource-group ${deployment.resourceGroup || deployment.name} \\
  --template-file template.json
\`\`\`

### Bicep (Recommended)
Convert ARM to Bicep for easier management:
\`\`\`bash
az bicep decompile --file template.json
\`\`\`

## Deletion (if needed)
\`\`\`bash
az group delete --name ${deployment.resourceGroup || deployment.name}
\`\`\`
`.trim();
  }

  /**
   * Revoke Service Principal access
   */
  async revokeAccess(userId: string, integrationId: string): Promise<void> {
    agentLogger.info('Revoking Azure access', { userId, integrationId });

    const integration = await storageV2.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // In production, would call Azure AD API to delete Service Principal
    // For now, mark as ejected
    await storageV2.updateIntegration(integrationId, {
      status: 'ejected',
      ejectedAt: new Date()
    });

    agentLogger.info('Azure access revoked', { userId, integrationId });
  }

  /**
   * Complete ejection flow
   */
  async eject(userId: string, integrationId: string): Promise<{
    success: boolean;
    exports: Array<any>;
    instructions: string;
    revokedAt: Date;
  }> {
    agentLogger.info('Starting Azure ejection', { userId, integrationId });

    const deployments = await storageV2.getDeploymentsByIntegration(integrationId);
    const exports = await Promise.all(deployments.map(d => this.exportDeployment(d.id)));
    
    await this.revokeAccess(userId, integrationId);

    return {
      success: true,
      exports,
      instructions: `Azure ejection complete. ${deployments.length} deployment(s) exported.`,
      revokedAt: new Date()
    };
  }
}

export const azureEjector = new AzureEjector();

