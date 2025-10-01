/**
 * AZURE CONTAINER APPS DEPLOYMENT SERVICE
 * Real Azure deployment - NO MOCKS OR SIMULATIONS
 */

import { ContainerAppsAPIClient } from "@azure/arm-appcontainers";
import { ContainerRegistryManagementClient } from "@azure/arm-containerregistry";
import { AzureCliCredential } from "@azure/identity";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
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
  private credential: AzureCliCredential;
  private config: AzureConfig;

  constructor() {
    // Get Azure subscription ID from environment
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

    if (!subscriptionId) {
      console.warn('⚠️ AZURE_SUBSCRIPTION_ID not found - Azure deployment features will be disabled');
      // Don't throw error, allow server to start without Azure
      return;
    }

    // Use Azure CLI credentials (requires 'az login')
    this.credential = new AzureCliCredential();

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
      // Prepare source code in build directory
      let buildDir = '.';
      if (spec.sourceCode) {
        buildDir = await this.prepareSourceCode(spec);
      }

      // Use Azure Container Registry build (no local Docker needed)
      console.log('🔨 Building image in Azure Container Registry...');
      const buildCommand = `az acr build --registry ${this.config.containerRegistry} --image ${imageTag} --timeout 600 ${buildDir}`;

      const { stdout } = await execAsync(buildCommand, {
        timeout: 600000, // 10 minute timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for build logs
      });

      console.log('✅ ACR Build output:', stdout.substring(0, 500));

      return fullImageName;
    } catch (error) {
      throw new Error(`Failed to build/push image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Prepare source code for building
   */
  private async prepareSourceCode(spec: DeploymentSpec): Promise<string> {
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
    if (!spec.dockerfilePath && !spec.sourceCode?.['Dockerfile']) {
      await this.generateDockerfile(buildDir, spec);
    }

    return buildDir;
  }

  /**
   * Generate appropriate Dockerfile based on project type
   */
  private async generateDockerfile(buildDir: string, spec: DeploymentSpec): Promise<void> {

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
RUN npm install --production || npm install --omit=dev
COPY . .
EXPOSE ${spec.port || 3000}
CMD ["npm", "start"]
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
   * Create or update Container App in Azure (using Azure CLI)
   */
  private async createOrUpdateContainerApp(spec: DeploymentSpec, imageName: string) {
    const containerAppName = spec.appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // Get registry password
    const registryPassword = await this.getRegistryPassword();

    // Build environment variables string
    const envVarsStr = Object.entries(spec.envVars || {})
      .map(([name, value]) => `${name}=${value}`)
      .join(' ');

    // Create/Update Container App using Azure CLI (more reliable than SDK)
    console.log('✨ Creating/Updating Container App via Azure CLI...');

    const createCommand = `az containerapp create --name ${containerAppName} --resource-group ${this.config.resourceGroupName} --environment ${this.config.containerAppsEnvironment} --image ${imageName} --target-port ${spec.port || 3000} --ingress external --registry-server ${this.config.containerRegistry}.azurecr.io --registry-username ${this.config.containerRegistry} --registry-password "${registryPassword}" --cpu ${spec.cpu || 0.5} --memory ${spec.memory || '1Gi'} --min-replicas 1 --max-replicas 3 ${envVarsStr ? `--env-vars ${envVarsStr}` : ''}`;

    try {
      await execAsync(createCommand, {
        timeout: 600000, // 10 minute timeout
        maxBuffer: 10 * 1024 * 1024
      });

      // Get FQDN in a separate command
      const { stdout } = await execAsync(`az containerapp show --name ${containerAppName} --resource-group ${this.config.resourceGroupName} --query properties.configuration.ingress.fqdn -o tsv`);
      const fqdn = stdout.trim();
      console.log(`✅ Container App created/updated: ${fqdn}`);

      // Return a mock container app object with the necessary properties
      return {
        name: containerAppName,
        properties: {
          provisioningState: 'Succeeded',
          configuration: {
            ingress: {
              fqdn
            }
          }
        }
      };
    } catch (error: any) {
      // If creation fails, try update instead
      console.log('Trying update instead...');
      const updateCommand = `az containerapp update --name ${containerAppName} --resource-group ${this.config.resourceGroupName} --image ${imageName}`;

      await execAsync(updateCommand, {
        timeout: 600000,
        maxBuffer: 10 * 1024 * 1024
      });

      // Get FQDN in a separate command
      const { stdout } = await execAsync(`az containerapp show --name ${containerAppName} --resource-group ${this.config.resourceGroupName} --query properties.configuration.ingress.fqdn -o tsv`);
      const fqdn = stdout.trim();
      console.log(`✅ Container App updated: ${fqdn}`);

      return {
        name: containerAppName,
        properties: {
          provisioningState: 'Succeeded',
          configuration: {
            ingress: {
              fqdn
            }
          }
        }
      };
    }
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

// Singleton instance - only create if Azure is configured
let azureContainerApps: AzureContainerAppsService | null = null;

try {
  azureContainerApps = new AzureContainerAppsService();
} catch (error) {
  console.warn('⚠️ Azure Container Apps service not initialized:', error instanceof Error ? error.message : String(error));
}

export { azureContainerApps };