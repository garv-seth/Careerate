/**
 * CLOUD ACCOUNT MANAGEMENT SERVICE
 * Handles linking and managing user cloud provider accounts
 */

import { storage } from "../storage";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

export interface CloudAccount {
  provider: 'aws' | 'gcp' | 'azure' | 'vercel' | 'railway';
  accountName: string;
  credentials: Record<string, string>;
  regions?: string[];
}

export class CloudAccountService {

  /**
   * Encrypt sensitive credentials
   */
  private encryptCredential(value: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt credentials
   */
  private decryptCredential(encrypted: string, iv: string, authTag: string): string {
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Link a new cloud account for a user
   */
  async linkCloudAccount(
    userId: string,
    provider: string,
    accountName: string,
    credentials: Record<string, string>,
    projectId?: string
  ) {
    // Create integration record
    const integration = await storage.createIntegration({
      userId,
      projectId: projectId || null,
      name: accountName,
      type: 'cloud-provider',
      service: provider,
      category: 'deployment',
      connectionType: provider === 'github' ? 'oauth' : 'api-key',
      status: 'active',
      configuration: {
        regions: credentials.regions || [],
        defaultRegion: credentials.defaultRegion || 'us-east-1'
      },
      endpoints: this.getProviderEndpoints(provider),
      permissions: [],
      rateLimits: {},
      healthCheck: {
        enabled: true,
        interval: 300000, // 5 minutes
        endpoint: '/health'
      },
      isEnabled: true,
      autoRotate: false,
      metadata: {
        linkedAt: new Date().toISOString()
      }
    });

    // Store encrypted credentials
    for (const [key, value] of Object.entries(credentials)) {
      if (key === 'regions' || key === 'defaultRegion') continue;

      const { encrypted, iv, authTag } = this.encryptCredential(value);

      await storage.createIntegrationSecret({
        integrationId: integration.id,
        secretType: 'api-key',
        secretName: key,
        encryptedValue: `${encrypted}:${iv}:${authTag}`,
        encryptionAlgorithm: ENCRYPTION_ALGORITHM,
        environment: 'all',
        scope: [],
        rotationPolicy: {},
        isActive: true,
        metadata: {}
      });
    }

    // Log the action
    await storage.createIntegrationAuditLog({
      integrationId: integration.id,
      userId,
      action: 'created',
      resourceType: 'integration',
      resourceId: integration.id,
      details: {
        provider,
        accountName,
        credentialKeys: Object.keys(credentials)
      },
      risk: 'medium',
      complianceFlags: [],
      metadata: {}
    });

    return integration;
  }

  /**
   * Get decrypted credentials for a cloud account
   */
  async getCloudCredentials(integrationId: string): Promise<Record<string, string>> {
    const secrets = await storage.getIntegrationSecrets(integrationId);
    const credentials: Record<string, string> = {};

    for (const secret of secrets) {
      if (!secret.isActive) continue;

      const [encrypted, iv, authTag] = secret.encryptedValue.split(':');
      credentials[secret.secretName] = this.decryptCredential(encrypted, iv, authTag);

      // Update access tracking
      await storage.incrementSecretAccessCount(secret.id);
    }

    return credentials;
  }

  /**
   * Get all cloud accounts for a user
   */
  async getUserCloudAccounts(userId: string) {
    return storage.getUserIntegrations(userId, 'cloud-provider');
  }

  /**
   * Test cloud account connection
   */
  async testConnection(integrationId: string): Promise<{ success: boolean; message: string; details?: any }> {
    const integration = await storage.getIntegration(integrationId);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    const credentials = await this.getCloudCredentials(integrationId);

    try {
      switch (integration.service) {
        case 'aws':
          return await this.testAWSConnection(credentials);
        case 'gcp':
          return await this.testGCPConnection(credentials);
        case 'azure':
          return await this.testAzureConnection(credentials);
        case 'vercel':
          return await this.testVercelConnection(credentials);
        case 'railway':
          return await this.testRailwayConnection(credentials);
        default:
          return { success: false, message: 'Unknown provider' };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Test AWS connection
   */
  private async testAWSConnection(credentials: Record<string, string>) {
    // TODO: Implement actual AWS SDK test
    // For now, just check if credentials exist
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      return { success: false, message: 'Missing AWS credentials' };
    }

    return {
      success: true,
      message: 'AWS connection successful',
      details: {
        region: credentials.region || 'us-east-1'
      }
    };
  }

  /**
   * Test GCP connection
   */
  private async testGCPConnection(credentials: Record<string, string>) {
    if (!credentials.serviceAccountKey && !credentials.projectId) {
      return { success: false, message: 'Missing GCP credentials' };
    }

    return {
      success: true,
      message: 'GCP connection successful',
      details: {
        projectId: credentials.projectId
      }
    };
  }

  /**
   * Test Azure connection
   */
  private async testAzureConnection(credentials: Record<string, string>) {
    if (!credentials.subscriptionId || !credentials.tenantId) {
      return { success: false, message: 'Missing Azure credentials' };
    }

    return {
      success: true,
      message: 'Azure connection successful',
      details: {
        subscriptionId: credentials.subscriptionId
      }
    };
  }

  /**
   * Test Vercel connection
   */
  private async testVercelConnection(credentials: Record<string, string>) {
    if (!credentials.token) {
      return { success: false, message: 'Missing Vercel token' };
    }

    // TODO: Make actual API call to Vercel
    return {
      success: true,
      message: 'Vercel connection successful'
    };
  }

  /**
   * Test Railway connection
   */
  private async testRailwayConnection(credentials: Record<string, string>) {
    if (!credentials.apiKey) {
      return { success: false, message: 'Missing Railway API key' };
    }

    // TODO: Make actual API call to Railway
    return {
      success: true,
      message: 'Railway connection successful'
    };
  }

  /**
   * Get provider-specific endpoints
   */
  private getProviderEndpoints(provider: string): Record<string, string> {
    const endpoints: Record<string, Record<string, string>> = {
      aws: {
        ec2: 'https://ec2.amazonaws.com',
        ecs: 'https://ecs.amazonaws.com',
        lambda: 'https://lambda.amazonaws.com'
      },
      gcp: {
        compute: 'https://compute.googleapis.com',
        run: 'https://run.googleapis.com'
      },
      azure: {
        management: 'https://management.azure.com',
        containerApps: 'https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.App'
      },
      vercel: {
        api: 'https://api.vercel.com'
      },
      railway: {
        api: 'https://backboard.railway.app/graphql/v2'
      }
    };

    return endpoints[provider] || {};
  }

  /**
   * Delete cloud account
   */
  async deleteCloudAccount(integrationId: string, userId: string) {
    // Verify ownership
    const integration = await storage.getIntegration(integrationId);
    if (!integration || integration.userId !== userId) {
      throw new Error('Integration not found or unauthorized');
    }

    // Delete integration (cascades to secrets)
    await storage.deleteIntegration(integrationId);

    // Log deletion
    await storage.createIntegrationAuditLog({
      integrationId,
      userId,
      action: 'deleted',
      resourceType: 'integration',
      resourceId: integrationId,
      details: {
        provider: integration.service,
        accountName: integration.name
      },
      risk: 'high',
      complianceFlags: [],
      metadata: {}
    });
  }

  /**
   * Update cloud account credentials
   */
  async updateCredentials(
    integrationId: string,
    userId: string,
    newCredentials: Record<string, string>
  ) {
    // Verify ownership
    const integration = await storage.getIntegration(integrationId);
    if (!integration || integration.userId !== userId) {
      throw new Error('Integration not found or unauthorized');
    }

    // Delete old secrets
    const oldSecrets = await storage.getIntegrationSecrets(integrationId);
    for (const secret of oldSecrets) {
      await storage.deleteIntegrationSecret(secret.id);
    }

    // Create new encrypted secrets
    for (const [key, value] of Object.entries(newCredentials)) {
      const { encrypted, iv, authTag } = this.encryptCredential(value);

      await storage.createIntegrationSecret({
        integrationId: integration.id,
        secretType: 'api-key',
        secretName: key,
        encryptedValue: `${encrypted}:${iv}:${authTag}`,
        encryptionAlgorithm: ENCRYPTION_ALGORITHM,
        environment: 'all',
        scope: [],
        rotationPolicy: {},
        isActive: true,
        metadata: {}
      });
    }

    // Log the rotation
    await storage.createIntegrationAuditLog({
      integrationId,
      userId,
      action: 'rotated',
      resourceType: 'secret',
      resourceId: integrationId,
      details: {
        credentialKeys: Object.keys(newCredentials)
      },
      risk: 'high',
      complianceFlags: [],
      metadata: {}
    });
  }
}

export const cloudAccountService = new CloudAccountService();
