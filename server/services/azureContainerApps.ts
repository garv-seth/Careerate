/**
 * AZURE CONTAINER APPS DEPLOYMENT SERVICE
 * Real Azure deployment - NO MOCKS OR SIMULATIONS
 */

import { ContainerAppsAPIClient } from "@azure/arm-appcontainers";
import { ContainerRegistryManagementClient } from "@azure/arm-containerregistry";
import { ClientSecretCredential } from "@azure/identity";
import { exec } from "child_process";
import { promisify } from "util";
import { storage } from "../storage";

const execAsync = promisify(exec);

interface AzureConfig {
  subscriptionId: string;
  resourceGroupName: string;
  containerAppsEnvironment: string;
  containerRegistry: string;
  location: string;
}

interface DeploymentSpec {
  projectId: string;
  appName: string;
  image?: string;
  dockerfilePath?: string;
  sourceCode?: Record<string, string>;
  envVars?: Record<string, string>;
  port?: number;
  cpu?: number;
  memory?: string;
}

export class AzureContainerAppsService {
  private client: ContainerAppsAPIClient;
  private registryClient: ContainerRegistryManagementClient;
  private credential: ClientSecretCredential;
  private config: AzureConfig;

  constructor() {
    // Get Azure credentials from environment
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      throw new Error('Missing Azure credentials. Please set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_SUBSCRIPTION_ID');
    }

    this.credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );

    this.client = new ContainerAppsAPIClient(this.credential, subscriptionId);
    this.registryClient = new ContainerRegistryManagementClient(this.credential, subscriptionId);

    this.config = {
      subscriptionId,
      resourceGroupName: process.env.AZURE_RESOURCE_GROUP || 'Careerate',
      containerAppsEnvironment: process.env.AZURE_CONTAINER_APPS_ENV || 'careerate-agents-env',
      containerRegistry: process.env.AZURE_CONTAINER_REGISTRY || 'careerateacr',
      location: process.env.AZURE_LOCATION || 'westus2'
    };

    console.log('✅ Azure Container Apps Service initialized:', {
      resourceGroup: this.config.resourceGroupName,
      environment: this.config.containerAppsEnvironment,
      registry: this.config.containerRegistry
    });
  }

  /**
   * Deploy an application to Azure Container Apps
   */
  async deployApp(spec: DeploymentSpec): Promise<{
    url: string;
    containerAppName: string;
    fqdn: string;
    status: string;
  }> {
    try {
      console.log(`🚀 Starting Azure deployment for project ${spec.projectId}`);

      // Step 1: Build and push Docker image
      const imageName = await this.buildAndPushImage(spec);
      console.log(`✅ Image built and pushed: ${imageName}`);

      // Step 2: Create or update Container App
      const containerApp = await this.createOrUpdateContainerApp(spec, imageName);
      console.log(`✅ Container App deployed: ${containerApp.name}`);

      // Step 3: Get the app URL
      const fqdn = containerApp.properties?.configuration?.ingress?.fqdn || '';
      const url = fqdn ? `https://${fqdn}` : '';

      return {
        url,
        containerAppName: containerApp.name || '',
        fqdn,
        status: containerApp.properties?.provisioningState || 'Unknown'
      };
    } catch (error) {
      console.error('❌ Azure deployment failed:', error);
      throw new Error(`Azure deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build Docker image and push to Azure Container Registry
   */
  private async buildAndPushImage(spec: DeploymentSpec): Promise<string> {
    const imageTag = `${spec.appName}-${Date.now()}`;
    const fullImageName = `${this.config.containerRegistry}.azurecr.io/${imageTag}`;

    try {
      // If source code provided, write files and build
      if (spec.sourceCode) {
        await this.prepareSourceCode(spec);
      }

      // Login to Azure Container Registry
      console.log('🔐 Logging into Azure Container Registry...');
      await execAsync(`az acr login --name ${this.config.containerRegistry}`);

      // Build Docker image
      console.log('🔨 Building Docker image...');
      const dockerfilePath = spec.dockerfilePath || './Dockerfile';
      const buildCommand = `docker build -t ${fullImageName} -f ${dockerfilePath} .`;
      await execAsync(buildCommand, { timeout: 600000 }); // 10 minute timeout

      // Push to registry
      console.log('📤 Pushing image to registry...');
      await execAsync(`docker push ${fullImageName}`);

      return fullImageName;
    } catch (error) {
      throw new Error(`Failed to build/push image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Prepare source code for building
   */
  private async prepareSourceCode(spec: DeploymentSpec): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');

    const buildDir = path.join(process.cwd(), 'builds', spec.projectId);

    // Create build directory
    await fs.mkdir(buildDir, { recursive: true });

    // Write all source files
    if (spec.sourceCode) {
      for (const [filePath, content] of Object.entries(spec.sourceCode)) {
        const fullPath = path.join(buildDir, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content);
      }
    }

    // Generate Dockerfile if not provided
    if (!spec.dockerfilePath) {
      await this.generateDockerfile(buildDir, spec);
    }
  }

  /**
   * Generate appropriate Dockerfile based on project type
   */
  private async generateDockerfile(buildDir: string, spec: DeploymentSpec): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');

    // Detect framework from package.json or files
    const framework = await this.detectFramework(buildDir);

    let dockerfile = '';

    switch (framework) {
      case 'node':
      case 'express':
        dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE ${spec.port || 3000}
CMD ["node", "server.js"]
`;
        break;

      case 'react':
      case 'next':
        dockerfile = `
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE ${spec.port || 3000}
CMD ["npm", "start"]
`;
        break;

      default:
        dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE ${spec.port || 3000}
CMD ["npm", "start"]
`;
    }

    await fs.writeFile(path.join(buildDir, 'Dockerfile'), dockerfile.trim());
  }

  /**
   * Detect framework from project files
   */
  private async detectFramework(buildDir: string): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const packageJsonPath = path.join(buildDir, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      if (packageJson.dependencies?.next) return 'next';
      if (packageJson.dependencies?.react) return 'react';
      if (packageJson.dependencies?.express) return 'express';

      return 'node';
    } catch {
      return 'node';
    }
  }

  /**
   * Create or update Container App in Azure
   */
  private async createOrUpdateContainerApp(spec: DeploymentSpec, imageName: string) {
    const containerAppName = spec.appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const containerAppEnvelope = {
      location: this.config.location,
      properties: {
        managedEnvironmentId: `/subscriptions/${this.config.subscriptionId}/resourceGroups/${this.config.resourceGroupName}/providers/Microsoft.App/managedEnvironments/${this.config.containerAppsEnvironment}`,
        configuration: {
          ingress: {
            external: true,
            targetPort: spec.port || 3000,
            transport: 'http',
            allowInsecure: false
          },
          registries: [
            {
              server: `${this.config.containerRegistry}.azurecr.io`,
              username: this.config.containerRegistry,
              passwordSecretRef: 'registry-password'
            }
          ],
          secrets: [
            {
              name: 'registry-password',
              value: await this.getRegistryPassword()
            }
          ]
        },
        template: {
          containers: [
            {
              name: containerAppName,
              image: imageName,
              resources: {
                cpu: spec.cpu || 0.5,
                memory: spec.memory || '1Gi'
              },
              env: Object.entries(spec.envVars || {}).map(([name, value]) => ({
                name,
                value
              }))
            }
          ],
          scale: {
            minReplicas: 1,
            maxReplicas: 3,
            rules: [
              {
                name: 'http-scaling',
                http: {
                  metadata: {
                    concurrentRequests: '10'
                  }
                }
              }
            ]
          }
        }
      }
    };

    // Check if app exists
    let containerApp;
    try {
      containerApp = await this.client.containerApps.get(
        this.config.resourceGroupName,
        containerAppName
      );

      // Update existing app
      console.log('📝 Updating existing Container App...');
      containerApp = await this.client.containerApps.beginCreateOrUpdateAndWait(
        this.config.resourceGroupName,
        containerAppName,
        containerAppEnvelope
      );
    } catch {
      // Create new app
      console.log('✨ Creating new Container App...');
      containerApp = await this.client.containerApps.beginCreateOrUpdateAndWait(
        this.config.resourceGroupName,
        containerAppName,
        containerAppEnvelope
      );
    }

    return containerApp;
  }

  /**
   * Get Azure Container Registry password
   */
  private async getRegistryPassword(): Promise<string> {
    try {
      const credentials = await this.registryClient.registries.listCredentials(
        this.config.resourceGroupName,
        this.config.containerRegistry
      );

      return credentials.passwords?.[0]?.value || '';
    } catch (error) {
      console.error('Failed to get registry credentials:', error);
      throw error;
    }
  }

  /**
   * Delete a Container App
   */
  async deleteApp(containerAppName: string): Promise<void> {
    try {
      await this.client.containerApps.beginDeleteAndWait(
        this.config.resourceGroupName,
        containerAppName
      );
      console.log(`✅ Deleted Container App: ${containerAppName}`);
    } catch (error) {
      throw new Error(`Failed to delete app: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get Container App status
   */
  async getAppStatus(containerAppName: string) {
    try {
      const app = await this.client.containerApps.get(
        this.config.resourceGroupName,
        containerAppName
      );

      return {
        name: app.name,
        status: app.properties?.provisioningState,
        fqdn: app.properties?.configuration?.ingress?.fqdn,
        url: app.properties?.configuration?.ingress?.fqdn
          ? `https://${app.properties.configuration.ingress.fqdn}`
          : null,
        replicas: app.properties?.template?.scale?.minReplicas || 0
      };
    } catch (error) {
      throw new Error(`Failed to get app status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Restart a Container App
   */
  async restartApp(containerAppName: string): Promise<void> {
    try {
      // Get current app config
      const app = await this.client.containerApps.get(
        this.config.resourceGroupName,
        containerAppName
      );

      // Trigger restart by updating the app (Azure Container Apps doesn't have direct restart)
      await this.client.containerApps.beginCreateOrUpdateAndWait(
        this.config.resourceGroupName,
        containerAppName,
        app
      );

      console.log(`✅ Restarted Container App: ${containerAppName}`);
    } catch (error) {
      throw new Error(`Failed to restart app: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Singleton instance
export const azureContainerApps = new AzureContainerAppsService();