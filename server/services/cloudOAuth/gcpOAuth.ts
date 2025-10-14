/**
 * GCP OAuth Service
 * User connects GCP account via OAuth 2.0 + Service Account
 */

import { storage } from '../../storage';
import crypto from 'crypto';

interface GCPConnectionResult {
  success: boolean;
  integrationId?: string;
  authUrl?: string;
  error?: string;
}

export class GCPOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GCP_OAUTH_CLIENT_ID || '';
    this.clientSecret = process.env.GCP_OAUTH_CLIENT_SECRET || '';
    this.redirectUri = process.env.GCP_OAUTH_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/gcp/callback`;
  }

  /**
   * Initiate GCP OAuth flow
   */
  async initiateOAuth(userId: string): Promise<GCPConnectionResult> {
    try {
      if (!this.clientId) {
        // Lazy-load from Key Vault if not present in env
        const { keyVaultService } = await import('../../services/azureKeyVaultService');
        this.clientId = (await keyVaultService.getSecret('GCP-OAUTH-CLIENT-ID')) || '';
        this.clientSecret = this.clientSecret || (await keyVaultService.getSecret('GCP-OAUTH-CLIENT-SECRET')) || '';
        this.redirectUri = this.redirectUri || (await keyVaultService.getSecret('GCP-OAUTH-REDIRECT-URI')) || `${process.env.BASE_URL}/api/oauth/gcp/callback`;
      }
      if (!this.clientId) {
        return {
          success: false,
          error: 'GCP OAuth not configured. Missing GCP_OAUTH_CLIENT_ID.'
        };
      }

      const state = crypto.randomBytes(16).toString('hex');

      // Store state for verification
      await storage.storeOAuthState(userId, 'gcp', state, {
        initiatedAt: new Date().toISOString()
      });

      // GCP OAuth endpoint
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', this.redirectUri);
      authUrl.searchParams.set('scope', [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloudresourcemanager',
        'openid',
        'email',
        'profile'
      ].join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      return {
        success: true,
        authUrl: authUrl.toString()
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to initiate GCP OAuth'
      };
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    code: string,
    state: string,
    userId: string
  ): Promise<GCPConnectionResult> {
    try {
      // Verify state
      const storedState = await storage.verifyOAuthState(userId, 'gcp', state);
      if (!storedState) {
        return {
          success: false,
          error: 'Invalid OAuth state. Please try connecting again.'
        };
      }

      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return {
          success: false,
          error: tokenData.error_description || 'Failed to get access token'
        };
      }

      // Get user projects
      const projects = await this.getProjects(tokenData.access_token);

      if (projects.length === 0) {
        return {
          success: false,
          error: 'No GCP projects found. Please create a project first.'
        };
      }

      // Use first project (or let user choose in UI)
      const project = projects[0];

      // Create integration
      const integration = await storage.createIntegration({
        userId,
        projectId: null,
        name: `GCP (${project.name})`,
        type: 'cloud-provider',
        service: 'gcp',
        category: 'deployment',
        connectionType: 'oauth',
        status: 'active',
        configuration: {
          projectId: project.projectId,
          projectNumber: project.projectNumber,
          projectName: project.name,
          connectedAt: new Date().toISOString()
        },
        endpoints: {
          console: 'https://console.cloud.google.com',
          compute: 'https://compute.googleapis.com',
          run: 'https://run.googleapis.com'
        },
        permissions: ['deploy', 'manage', 'monitor', 'scale'],
        rateLimits: {},
        healthCheck: {
          enabled: true,
          interval: 300000,
          endpoint: 'projects'
        },
        isEnabled: true,
        autoRotate: true,
        metadata: {
          setupMethod: 'oauth',
          tokenExpiry: tokenData.expires_in
        }
      });

      // Store encrypted tokens
      await storage.createIntegrationSecret({
        integrationId: integration.id,
        secretType: 'oauth-token',
        secretName: 'accessToken',
        encryptedValue: this.encrypt(tokenData.access_token),
        encryptionAlgorithm: 'aes-256-gcm',
        environment: 'all',
        scope: [],
        rotationPolicy: {
          enabled: true,
          intervalDays: 90
        },
        isActive: true,
        metadata: {
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        }
      });

      if (tokenData.refresh_token) {
        await storage.createIntegrationSecret({
          integrationId: integration.id,
          secretType: 'oauth-refresh-token',
          secretName: 'refreshToken',
          encryptedValue: this.encrypt(tokenData.refresh_token),
          encryptionAlgorithm: 'aes-256-gcm',
          environment: 'all',
          scope: [],
          rotationPolicy: {},
          isActive: true,
          metadata: {}
        });
      }

      // Log connection
      await storage.createIntegrationAuditLog({
        integrationId: integration.id,
        userId,
        action: 'created',
        resourceType: 'integration',
        resourceId: integration.id,
        details: {
          provider: 'gcp',
          projectId: project.projectId,
          method: 'oauth'
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
      console.error('GCP OAuth callback error:', error);
      return {
        success: false,
        error: error.message || 'Failed to complete GCP connection'
      };
    }
  }

  /**
   * Get user's GCP projects
   */
  private async getProjects(accessToken: string): Promise<any[]> {
    try {
      const response = await fetch(
        'https://cloudresourcemanager.googleapis.com/v1/projects',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      return data.projects || [];

    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(value: string): string {
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key.slice(0, 64), 'hex'), iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${encrypted}:${iv.toString('hex')}:${authTag.toString('hex')}`;
  }

  /**
   * Disconnect GCP account
   */
  async disconnectGCP(userId: string, integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const integration = await storage.getIntegration(integrationId);

      if (!integration || integration.userId !== userId) {
        return { success: false, message: 'Integration not found or unauthorized' };
      }

      if (integration.service !== 'gcp') {
        return { success: false, message: 'Not a GCP integration' };
      }

      // Delete integration (cascades to secrets)
      await storage.deleteIntegration(integrationId);

      // Log disconnection
      await storage.createIntegrationAuditLog({
        integrationId,
        userId,
        action: 'deleted',
        resourceType: 'integration',
        resourceId: integrationId,
        details: {
          provider: 'gcp',
          projectId: integration.configuration?.projectId
        },
        risk: 'high',
        complianceFlags: [],
        metadata: {}
      });

      return {
        success: true,
        message: 'GCP account disconnected successfully.'
      };

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to disconnect GCP account'
      };
    }
  }

  /**
   * Alternative: Connect via Service Account JSON
   */
  async connectViaServiceAccount(
    userId: string,
    serviceAccountJSON: string
  ): Promise<GCPConnectionResult> {
    try {
      const serviceAccount = JSON.parse(serviceAccountJSON);

      if (!serviceAccount.project_id || !serviceAccount.private_key) {
        return {
          success: false,
          error: 'Invalid service account JSON. Missing required fields.'
        };
      }

      // Create integration
      const integration = await storage.createIntegration({
        userId,
        projectId: null,
        name: `GCP (${serviceAccount.project_id})`,
        type: 'cloud-provider',
        service: 'gcp',
        category: 'deployment',
        connectionType: 'service-account',
        status: 'active',
        configuration: {
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          connectedAt: new Date().toISOString()
        },
        endpoints: {
          console: 'https://console.cloud.google.com',
          compute: 'https://compute.googleapis.com',
          run: 'https://run.googleapis.com'
        },
        permissions: ['deploy', 'manage', 'monitor', 'scale'],
        rateLimits: {},
        healthCheck: {
          enabled: true,
          interval: 300000,
          endpoint: 'projects'
        },
        isEnabled: true,
        autoRotate: false,
        metadata: {
          setupMethod: 'service-account'
        }
      });

      // Store encrypted service account
      await storage.createIntegrationSecret({
        integrationId: integration.id,
        secretType: 'service-account',
        secretName: 'serviceAccountKey',
        encryptedValue: this.encrypt(serviceAccountJSON),
        encryptionAlgorithm: 'aes-256-gcm',
        environment: 'all',
        scope: [],
        rotationPolicy: {},
        isActive: true,
        metadata: {}
      });

      return {
        success: true,
        integrationId: integration.id
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect GCP via service account'
      };
    }
  }
}

export const gcpOAuth = new GCPOAuth();

