/**
 * Azure OAuth Service
 * User connects Azure account via OAuth 2.0 + Service Principal
 */

import { storage } from '../../storage';
import crypto from 'crypto';

interface AzureConnectionResult {
  success: boolean;
  integrationId?: string;
  authUrl?: string;
  error?: string;
}

export class AzureOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  // App registration flow (client credentials) for discovery
  private async getAppToken(): Promise<string> {
    const clientId = process.env.AZURE_CLIENT_ID || this.clientId;
    const clientSecret = process.env.AZURE_CLIENT_SECRET || this.clientSecret;
    const tenantId = process.env.AZURE_TENANT_ID || 'common';
    if (!clientId || !clientSecret) throw new Error('Azure OAuth not configured');
    const params = new URLSearchParams();
    params.set('grant_type', 'client_credentials');
    params.set('client_id', clientId);
    params.set('client_secret', clientSecret);
    params.set('scope', 'https://management.azure.com/.default');
    const resp = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, { method: 'POST', body: params });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error_description || 'Failed to get Azure app token');
    return json.access_token;
  }

  constructor() {
    this.clientId = process.env.AZURE_OAUTH_CLIENT_ID || process.env.AZURE_CLIENT_ID || '';
    this.clientSecret = process.env.AZURE_OAUTH_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET || '';
    this.redirectUri = process.env.AZURE_OAUTH_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/azure/callback`;
  }

  /**
   * Initiate Azure OAuth flow
   */
  async initiateOAuth(userId: string): Promise<AzureConnectionResult> {
    try {
      if (!this.clientId) {
        return {
          success: false,
          error: 'Azure OAuth not configured. Missing AZURE_OAUTH_CLIENT_ID.'
        };
      }

      const state = crypto.randomBytes(16).toString('hex');
      const nonce = crypto.randomBytes(16).toString('hex');

      // Store state for verification
      await storage.storeOAuthState(userId, 'azure', state, {
        nonce,
        initiatedAt: new Date().toISOString()
      });

      // Azure OAuth endpoint
      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', this.redirectUri);
      authUrl.searchParams.set('response_mode', 'query');
      authUrl.searchParams.set('scope', [
        'https://management.azure.com/user_impersonation',
        'offline_access',
        'openid',
        'profile'
      ].join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('nonce', nonce);

      return {
        success: true,
        authUrl: authUrl.toString()
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to initiate Azure OAuth'
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
  ): Promise<AzureConnectionResult> {
    try {
      // Verify state
      const storedState = await storage.verifyOAuthState(userId, 'azure', state);
      if (!storedState) {
        return {
          success: false,
          error: 'Invalid OAuth state. Please try connecting again.'
        };
      }

      // Exchange code for token
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
          scope: 'https://management.azure.com/user_impersonation offline_access'
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return {
          success: false,
          error: tokenData.error_description || 'Failed to get access token'
        };
      }

      // Get subscriptions
      const subscriptions = await this.getSubscriptions(tokenData.access_token);
      
      if (subscriptions.length === 0) {
        return {
          success: false,
          error: 'No Azure subscriptions found. Please ensure you have an active subscription.'
        };
      }

      // Use first subscription (or let user choose in UI)
      const subscription = subscriptions[0];

      // Create integration
      const integration = await storage.createIntegration({
        userId,
        projectId: null,
        name: `Azure (${subscription.displayName})`,
        type: 'cloud-provider',
        service: 'azure',
        category: 'deployment',
        connectionType: 'oauth',
        status: 'active',
        configuration: {
          subscriptionId: subscription.subscriptionId,
          tenantId: tokenData.id_token_claims?.tid || 'common',
          subscriptionName: subscription.displayName,
          connectedAt: new Date().toISOString()
        },
        endpoints: {
          management: 'https://management.azure.com',
          portal: 'https://portal.azure.com'
        },
        permissions: ['deploy', 'manage', 'monitor', 'scale'],
        rateLimits: {},
        healthCheck: {
          enabled: true,
          interval: 300000,
          endpoint: 'subscriptions'
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
          provider: 'azure',
          subscriptionId: subscription.subscriptionId,
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
      console.error('Azure OAuth callback error:', error);
      return {
        success: false,
        error: error.message || 'Failed to complete Azure connection'
      };
    }
  }

  // Public discovery methods used by API routes (client credentials)
  async listSubscriptions(): Promise<any[]> {
    try {
      const token = await this.getAppToken();
      const r = await fetch('https://management.azure.com/subscriptions?api-version=2020-01-01', { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      return j.value || [];
    } catch (e) {
      return [];
    }
  }

  async listResourceGroups(subscriptionId: string): Promise<any[]> {
    try {
      const token = await this.getAppToken();
      const r = await fetch(`https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2021-04-01`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      return j.value || [];
    } catch (e) {
      return [];
    }
  }

  async listContainerApps(subscriptionId: string, resourceGroup?: string): Promise<any[]> {
    try {
      const token = await this.getAppToken();
      const url = resourceGroup
        ? `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.App/containerApps?api-version=2022-11-01`
        : `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.App/containerApps?api-version=2022-11-01`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      return j.value || [];
    } catch (e) {
      return [];
    }
  }

  async listContainerRegistries(subscriptionId: string, resourceGroup?: string): Promise<any[]> {
    try {
      const token = await this.getAppToken();
      const url = resourceGroup
        ? `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerRegistry/registries?api-version=2023-01-01-preview`
        : `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.ContainerRegistry/registries?api-version=2023-01-01-preview`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      return j.value || [];
    } catch (e) {
      return [];
    }
  }
  /**
   * Get user's Azure subscriptions
   */
  private async getSubscriptions(accessToken: string): Promise<any[]> {
    try {
      const response = await fetch('https://management.azure.com/subscriptions?api-version=2020-01-01', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      return data.value || [];

    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
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
   * Disconnect Azure account
   */
  async disconnectAzure(userId: string, integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const integration = await storage.getIntegration(integrationId);

      if (!integration || integration.userId !== userId) {
        return { success: false, message: 'Integration not found or unauthorized' };
      }

      if (integration.service !== 'azure') {
        return { success: false, message: 'Not an Azure integration' };
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
          provider: 'azure',
          subscriptionId: integration.configuration?.subscriptionId
        },
        risk: 'high',
        complianceFlags: [],
        metadata: {}
      });

      return {
        success: true,
        message: 'Azure account disconnected successfully.'
      };

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to disconnect Azure account'
      };
    }
  }
}

export const azureOAuth = new AzureOAuth();

