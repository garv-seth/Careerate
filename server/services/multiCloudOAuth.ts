/**
 * Multi-Cloud OAuth Service
 * Handles OAuth flows for AWS, GCP, Azure, Vercel, Railway, GitLab
 */

import { keyVaultService } from './azureKeyVaultService';
import { storage } from '../storage';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  userInfo?: any;
  errorMessage?: string;
}

class MultiCloudOAuthService {
  /**
   * Initiate GitHub OAuth
   */
  async initiateGitHubOAuth(redirectUri?: string): Promise<{ authUrl: string; state: string }> {
    // Try environment variables first, then Key Vault
    const clientId = process.env.GITHUB_CLIENT_ID || await keyVaultService.getSecret('GITHUB-CLIENT-ID');
    const defaultRedirect = process.env.GITHUB_REDIRECT_URI || await keyVaultService.getSecret('GITHUB-REDIRECT-URI');

    if (!clientId) {
      throw new Error('GitHub OAuth not configured');
    }

    const state = Math.random().toString(36).slice(2);
    const scopes = ['repo', 'user:email', 'read:org'];
    const redirect = redirectUri || defaultRedirect || 'http://localhost:5000/api/callback/github';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirect,
      scope: scopes.join(' '),
      state,
      allow_signup: 'true'
    });

    return {
      authUrl: `https://github.com/login/oauth/authorize?${params.toString()}`,
      state
    };
  }

  /**
   * Handle GitHub OAuth callback
   */
  async handleGitHubCallback(code: string, userId: string): Promise<OAuthResult> {
    const clientId = await keyVaultService.getSecret('GITHUB-CLIENT-ID');
    const clientSecret = await keyVaultService.getSecret('GITHUB-CLIENT-SECRET');
    const redirectUri = await keyVaultService.getSecret('GITHUB-REDIRECT-URI');

    if (!clientId || !clientSecret) {
      return { success: false, errorMessage: 'GitHub OAuth not configured' };
    }

    try {
      // Exchange code for token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return { success: false, errorMessage: 'Failed to get access token' };
      }

      // Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const userInfo = await userResponse.json();

      // Store integration
      await storage.createUserIntegration({
        userId,
        service: 'github',
        type: 'repository',
        name: `GitHub (${userInfo.login})`,
        status: 'active',
        configuration: {
          username: userInfo.login,
          userId: userInfo.id
        },
        healthCheck: null,
        createdAt: new Date(),
        lastSync: null
      });

      return {
        success: true,
        accessToken: tokenData.access_token,
        userInfo
      };

    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * Initiate GitLab OAuth
   */
  async initiateGitLabOAuth(redirectUri?: string): Promise<{ authUrl: string; state: string }> {
    const clientId = await keyVaultService.getSecret('GITLAB-CLIENT-ID');

    if (!clientId) {
      throw new Error('GitLab OAuth not configured');
    }

    const state = Math.random().toString(36).slice(2);
    const scopes = ['api', 'read_user', 'read_repository'];
    const redirect = redirectUri || 'http://localhost:5000/api/callback/gitlab';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirect,
      response_type: 'code',
      scope: scopes.join(' '),
      state
    });

    return {
      authUrl: `https://gitlab.com/oauth/authorize?${params.toString()}`,
      state
    };
  }

  /**
   * Handle GitLab OAuth callback
   */
  async handleGitLabCallback(code: string, userId: string): Promise<OAuthResult> {
    const clientId = await keyVaultService.getSecret('GITLAB-CLIENT-ID');
    const clientSecret = await keyVaultService.getSecret('GITLAB-CLIENT-SECRET');

    if (!clientId || !clientSecret) {
      return { success: false, errorMessage: 'GitLab OAuth not configured' };
    }

    try {
      const tokenResponse = await fetch('https://gitlab.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:5000/api/callback/gitlab'
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return { success: false, errorMessage: 'Failed to get access token' };
      }

      const userResponse = await fetch('https://gitlab.com/api/v4/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      const userInfo = await userResponse.json();

      await storage.createUserIntegration({
        userId,
        service: 'gitlab',
        type: 'repository',
        name: `GitLab (${userInfo.username})`,
        status: 'active',
        configuration: {
          username: userInfo.username,
          userId: userInfo.id
        },
        healthCheck: null,
        createdAt: new Date(),
        lastSync: null
      });

      return {
        success: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userInfo
      };

    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * Connect AWS account
   */
  async connectAWS(userId: string, accessKeyId: string, secretAccessKey: string, region: string): Promise<OAuthResult> {
    try {
      // Validate credentials by making a simple AWS API call
      // For now, just store them
      await storage.createUserIntegration({
        userId,
        service: 'aws',
        type: 'cloud-provider',
        name: `AWS (${region})`,
        status: 'active',
        configuration: {
          region,
          hasCredentials: true
        },
        healthCheck: null,
        createdAt: new Date(),
        lastSync: null
      });

      return {
        success: true,
        userInfo: { region }
      };

    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * Connect GCP account
   */
  async connectGCP(userId: string, serviceAccountJson: string, projectId: string): Promise<OAuthResult> {
    try {
      await storage.createUserIntegration({
        userId,
        service: 'gcp',
        type: 'cloud-provider',
        name: `GCP (${projectId})`,
        status: 'active',
        configuration: {
          projectId,
          hasServiceAccount: true
        },
        healthCheck: null,
        createdAt: new Date(),
        lastSync: null
      });

      return {
        success: true,
        userInfo: { projectId }
      };

    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * Initiate Vercel OAuth
   */
  async initiateVercelOAuth(redirectUri?: string): Promise<{ authUrl: string; state: string }> {
    // Vercel uses OAuth but for now we'll use API tokens
    // This would be implemented similar to GitHub OAuth
    const state = Math.random().toString(36).slice(2);

    return {
      authUrl: 'https://vercel.com/integrations/careerate',
      state
    };
  }

  /**
   * Connect Railway
   */
  async connectRailway(userId: string, apiToken: string): Promise<OAuthResult> {
    try {
      // Validate Railway token
      const response = await fetch('https://backboard.railway.app/graphql/v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: '{ me { id name } }'
        })
      });

      const data = await response.json();

      if (data.errors) {
        return { success: false, errorMessage: 'Invalid Railway API token' };
      }

      await storage.createUserIntegration({
        userId,
        service: 'railway',
        type: 'deployment',
        name: `Railway (${data.data.me.name})`,
        status: 'active',
        configuration: {
          userId: data.data.me.id
        },
        healthCheck: null,
        createdAt: new Date(),
        lastSync: null
      });

      return {
        success: true,
        userInfo: data.data.me
      };

    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }
}

export const multiCloudOAuth = new MultiCloudOAuthService();
