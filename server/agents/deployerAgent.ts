/**
 * Deployer Agent - REAL Azure Container Apps Deployment
 *
 * Uses: GPT-4o for deployment orchestration, Claude 4.5 for critical failures
 * NO MOCKS - Real Azure SDK calls
 */

import { ContainerAppsAPIClient } from '@azure/arm-appcontainers';
import { DefaultAzureCredential } from '@azure/identity';
import type { DeploymentPlan } from './plannerAgent';

export interface DeploymentResult {
  success: boolean;
  appName: string;
  url: string;
  resourceId: string;
  region: string;
  status: string;
  createdAt: Date;
}

export class DeployerAgent {
  private azureClient: ContainerAppsAPIClient;

  constructor() {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

    if (!subscriptionId) {
      throw new Error('AZURE_SUBSCRIPTION_ID not configured');
    }

    this.azureClient = new ContainerAppsAPIClient(credential, subscriptionId);
  }

  /**
   * Execute deployment - REAL Azure Container Apps
   */
  async deploy(plan: DeploymentPlan, userId: string): Promise<DeploymentResult> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';
    const environmentId = process.env.AZURE_MANAGED_ENV_ID;

    if (!environmentId) {
      throw new Error('AZURE_MANAGED_ENV_ID not configured');
    }

    const appName = plan.appName || `app-${Date.now()}`;

    console.log(`[DeployerAgent] 🚀 Deploying: ${appName}`);
    console.log(`[DeployerAgent] Infrastructure:`, plan.infrastructure);
    console.log(`[DeployerAgent] Region:`, plan.region);

    try {
      // REAL Azure Container Apps API call
      const containerApp = await this.azureClient.containerApps.beginCreateOrUpdateAndWait(
        resourceGroup,
        appName,
        {
          location: plan.region || 'westus2',
          properties: {
            managedEnvironmentId: environmentId,
            configuration: {
              ingress: {
                external: true,
                targetPort: plan.port || 3000,
                allowInsecure: false,
                traffic: [{
                  latestRevision: true,
                  weight: 100
                }]
              }
            },
            template: {
              containers: [{
                name: appName,
                image: plan.dockerImage || 'nginx:latest',
                resources: {
                  cpu: plan.cpu || 0.5,
                  memory: plan.memory || '1Gi'
                }
              }],
              scale: {
                minReplicas: 1,
                maxReplicas: 3
              }
            }
          },
          tags: {
            deployedBy: 'careerate',
            userId,
            techStack: plan.techStack,
            createdAt: new Date().toISOString()
          }
        }
      );

      const url = `https://${containerApp.properties?.latestRevisionFqdn}`;

      console.log(`[DeployerAgent] ✅ Deployed successfully!`);
      console.log(`[DeployerAgent] URL: ${url}`);

      return {
        success: true,
        appName,
        url,
        resourceId: containerApp.id || '',
        region: containerApp.location || '',
        status: containerApp.properties?.provisioningState || 'unknown',
        createdAt: new Date()
      };

    } catch (error) {
      console.error('[DeployerAgent] ❌ Deployment failed:', error);
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  /**
   * Get deployment status
   */
  async getStatus(appName: string): Promise<any> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';

    try {
      const app = await this.azureClient.containerApps.get(resourceGroup, appName);
      return {
        name: app.name,
        status: app.properties?.provisioningState,
        url: `https://${app.properties?.latestRevisionFqdn}`,
        runningStatus: app.properties?.runningStatus
      };
    } catch (error) {
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * Delete deployment
   */
  async delete(appName: string): Promise<void> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';

    try {
      await this.azureClient.containerApps.beginDeleteAndWait(resourceGroup, appName);
      console.log(`[DeployerAgent] ✅ Deleted: ${appName}`);
    } catch (error) {
      throw new Error(`Deletion failed: ${error.message}`);
    }
  }
}
