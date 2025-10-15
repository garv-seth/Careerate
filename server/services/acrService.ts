/**
 * Azure Container Registry Service
 * Builds and pushes Docker images from code repositories
 */

import { ContainerRegistryManagementClient } from '@azure/arm-containerregistry';
import { DefaultAzureCredential } from '@azure/identity';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BuildResult {
  imageName: string;
  imageTag: string;
  fullImagePath: string;
  registry: string;
  buildTime: number;
}

export class ACRService {
  private client: ContainerRegistryManagementClient;
  private registryName: string;
  private registryUrl: string;

  constructor() {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    this.registryName = process.env.AZURE_CONTAINER_REGISTRY || 'careerateacr';
    this.registryUrl = `${this.registryName}.azurecr.io`;

    if (!subscriptionId) {
      throw new Error('AZURE_SUBSCRIPTION_ID not configured');
    }

    this.client = new ContainerRegistryManagementClient(credential, subscriptionId);
  }

  /**
   * Build and push Docker image using ACR Tasks (cloud build)
   * This is faster and doesn't require local Docker
   */
  async buildAndPush(
    repoPath: string,
    appName: string,
    dockerfilePath?: string
  ): Promise<BuildResult> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';
    const imageName = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const imageTag = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fullImagePath = `${this.registryUrl}/${imageName}:${imageTag}`;

    console.log(`[ACRService] 🏗️  Building Docker image: ${fullImagePath}`);

    const startTime = Date.now();

    try {
      // Use ACR Tasks to build in the cloud (no local Docker needed)
      // This uploads the source code and builds it in Azure
      const dockerfile = dockerfilePath
        ? path.relative(repoPath, dockerfilePath)
        : 'Dockerfile.generated';

      console.log(`[ACRService] Uploading source code to ACR...`);

      const buildCommand = `az acr build \
        --registry ${this.registryName} \
        --resource-group ${resourceGroup} \
        --image ${imageName}:${imageTag} \
        --file ${dockerfile} \
        "${repoPath}"`;

      const { stdout, stderr } = await execAsync(buildCommand, {
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large builds
      });

      if (stderr && !stderr.includes('Successfully')) {
        console.error('[ACRService] Build warnings:', stderr);
      }

      const buildTime = Date.now() - startTime;
      console.log(`[ACRService] ✅ Build completed in ${(buildTime / 1000).toFixed(2)}s`);

      return {
        imageName,
        imageTag,
        fullImagePath,
        registry: this.registryUrl,
        buildTime
      };

    } catch (error) {
      console.error('[ACRService] ❌ Build failed:', error);
      throw new Error(`Docker build failed: ${error.message}`);
    }
  }

  /**
   * List recent builds for an image
   */
  async listBuilds(imageName: string): Promise<any[]> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';

    try {
      const command = `az acr repository show-tags \
        --name ${this.registryName} \
        --repository ${imageName} \
        --orderby time_desc \
        --output json`;

      const { stdout } = await execAsync(command);
      return JSON.parse(stdout);

    } catch (error) {
      console.error('[ACRService] Failed to list builds:', error);
      return [];
    }
  }

  /**
   * Delete old image tags (cleanup)
   */
  async cleanupOldImages(imageName: string, keepCount: number = 5): Promise<void> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';

    try {
      const tags = await this.listBuilds(imageName);

      // Keep only the latest N tags
      const tagsToDelete = tags.slice(keepCount);

      for (const tag of tagsToDelete) {
        console.log(`[ACRService] 🗑️  Deleting old image: ${imageName}:${tag}`);

        const command = `az acr repository delete \
          --name ${this.registryName} \
          --image ${imageName}:${tag} \
          --yes`;

        await execAsync(command);
      }

      console.log(`[ACRService] ✅ Cleaned up ${tagsToDelete.length} old images`);

    } catch (error) {
      console.error('[ACRService] Cleanup failed:', error);
    }
  }

  /**
   * Get registry credentials for Container Apps
   */
  async getRegistryCredentials(): Promise<{ username: string; password: string }> {
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'Careerate';

    try {
      const command = `az acr credential show \
        --name ${this.registryName} \
        --resource-group ${resourceGroup} \
        --output json`;

      const { stdout } = await execAsync(command);
      const credentials = JSON.parse(stdout);

      return {
        username: credentials.username,
        password: credentials.passwords[0].value
      };

    } catch (error) {
      console.error('[ACRService] Failed to get credentials:', error);
      throw new Error('Failed to get ACR credentials');
    }
  }
}
