/**
 * Deployer Agent - REAL Azure Container Apps Deployment
 *
 * Uses: GPT-4o for deployment orchestration, Claude 4.5 for critical failures
 * NO MOCKS - Real Azure SDK calls
 *
 * Full flow:
 * 1. Clone GitHub repo (if provided)
 * 2. Analyze repo to detect framework
 * 3. Generate Dockerfile
 * 4. Build Docker image using ACR
 * 5. Deploy to Azure Container Apps
 */

import { ContainerAppsAPIClient } from '@azure/arm-appcontainers';
import { DefaultAzureCredential } from '@azure/identity';
import type { DeploymentPlan } from './plannerAgent';
import { GitHubRepoService } from '../services/githubRepoService';
import { ACRService } from '../services/acrService';

export interface DeploymentResult {
  success: boolean;
  appName: string;
  url: string;
  resourceId: string;
  region: string;
  status: string;
  createdAt: Date;
  dockerImage?: string;
  buildTime?: number;
}

export class DeployerAgent {
  private azureClient: ContainerAppsAPIClient;
  private githubService: GitHubRepoService;
  private acrService: ACRService;

  constructor() {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

    if (!subscriptionId) {
      throw new Error('AZURE_SUBSCRIPTION_ID not configured');
    }

    this.azureClient = new ContainerAppsAPIClient(credential, subscriptionId);
    this.githubService = new GitHubRepoService();
    this.acrService = new ACRService();
  }

  /**
   * Execute deployment - REAL Azure Container Apps
   * Full flow: GitHub clone → Build Docker → Deploy to Azure
   */
  async deploy(plan: DeploymentPlan, userId: string, repoUrl?: string): Promise<DeploymentResult> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';
    const environmentId = process.env.AZURE_MANAGED_ENV_ID;

    if (!environmentId) {
      throw new Error('AZURE_MANAGED_ENV_ID not configured');
    }

    const appName = plan.appName || `app-${Date.now()}`;
    let dockerImage = plan.dockerImage || 'nginx:latest';
    let buildTime: number | undefined;
    let repoPath: string | undefined;

    console.log(`[DeployerAgent] 🚀 Deploying: ${appName}`);
    console.log(`[DeployerAgent] Infrastructure:`, plan.infrastructure);
    console.log(`[DeployerAgent] Region:`, plan.region);

    try {
      // Step 1: If GitHub repo provided, clone and build custom image
      if (repoUrl) {
        console.log(`[DeployerAgent] 📦 Building from GitHub: ${repoUrl}`);

        // Clone repository
        repoPath = await this.githubService.cloneRepo(repoUrl);

        // Analyze repository structure
        const analysis = await this.githubService.analyzeRepo(repoPath);
        console.log(`[DeployerAgent] Detected: ${analysis.framework} (${analysis.language})`);

        // Update plan with detected settings
        plan.port = analysis.port;
        plan.techStack = analysis.framework;

        // Generate Dockerfile if not present
        await this.githubService.generateDockerfile(repoPath, analysis);

        // Build Docker image using ACR
        const buildResult = await this.acrService.buildAndPush(
          repoPath,
          appName,
          undefined // Will use Dockerfile.generated
        );

        dockerImage = buildResult.fullImagePath;
        buildTime = buildResult.buildTime;

        console.log(`[DeployerAgent] ✅ Built image: ${dockerImage}`);
      }

      // Step 2: Get ACR credentials for Container Apps
      const acrCredentials = await this.acrService.getRegistryCredentials();

      // Step 3: Deploy to Azure Container Apps with custom image
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
              },
              // Add ACR credentials for private registry access
              registries: repoUrl ? [{
                server: `${process.env.AZURE_CONTAINER_REGISTRY || 'careerateacr'}.azurecr.io`,
                username: acrCredentials.username,
                passwordSecretRef: 'acr-password'
              }] : undefined,
              secrets: repoUrl ? [{
                name: 'acr-password',
                value: acrCredentials.password
              }] : undefined
            },
            template: {
              containers: [{
                name: appName,
                image: dockerImage,
                resources: {
                  cpu: plan.cpu || 0.5,
                  memory: plan.memory || '1Gi'
                },
                // Add environment variables from repo analysis
                env: plan.environment ? Object.entries(plan.environment).map(([name, value]) => ({
                  name,
                  value: String(value)
                })) : undefined
              }],
              scale: {
                minReplicas: 1,
                maxReplicas: 10
              }
            }
          },
          tags: {
            deployedBy: 'careerate',
            userId,
            techStack: plan.techStack,
            createdAt: new Date().toISOString(),
            repoUrl: repoUrl || 'none'
          }
        }
      );

      const url = `https://${containerApp.properties?.latestRevisionFqdn}`;

      console.log(`[DeployerAgent] ✅ Deployed successfully!`);
      console.log(`[DeployerAgent] URL: ${url}`);

      // Cleanup cloned repo
      if (repoPath) {
        await this.githubService.cleanup(repoPath);
      }

      return {
        success: true,
        appName,
        url,
        resourceId: containerApp.id || '',
        region: containerApp.location || '',
        status: containerApp.properties?.provisioningState || 'unknown',
        createdAt: new Date(),
        dockerImage,
        buildTime
      };

    } catch (error) {
      console.error('[DeployerAgent] ❌ Deployment failed:', error);

      // Cleanup on failure
      if (repoPath) {
        await this.githubService.cleanup(repoPath);
      }

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
