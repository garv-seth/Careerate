/**
 * GITHUB REPOSITORY INTEGRATION SERVICE
 * Handles GitHub OAuth, repository access, and syncing
 */

import { Octokit } from "@octokit/rest";
import { storage } from "../storage";
import crypto from "crypto";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  html_url: string;
  description: string | null;
  default_branch: string;
  private: boolean;
  language: string | null;
  size: number;
  updated_at: string;
}

export class GitHubService {
  private octokit: Octokit | null = null;
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';

  /**
   * Initialize Octokit client with user's token
   */
  private getClient(token: string): Octokit {
    return new Octokit({ auth: token });
  }

  /**
   * Encrypt OAuth token using AES-256-GCM
   */
  private encryptToken(token: string): { encrypted: string; iv: string; authTag: string } {
    const encryptionKey = process.env.ENCRYPTION_KEY || process.env.AZURE_KEY_VAULT_URI;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }

    const iv = crypto.randomBytes(16);
    const key = Buffer.from(encryptionKey.slice(0, 64), 'hex').slice(0, 32);
    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt OAuth token
   */
  private decryptToken(encrypted: string, iv: string, authTag: string): string {
    const encryptionKey = process.env.ENCRYPTION_KEY || process.env.AZURE_KEY_VAULT_URI;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }

    const key = Buffer.from(encryptionKey.slice(0, 64), 'hex').slice(0, 32);
    const decipher = crypto.createDecipheriv(
      this.ENCRYPTION_ALGORITHM,
      key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Exchange GitHub OAuth code for access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth not configured');
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description}`);
    }

    return data.access_token;
  }

  /**
   * Get GitHub user info
   */
  async getUserInfo(token: string) {
    const octokit = this.getClient(token);
    const { data } = await octokit.users.getAuthenticated();
    return data;
  }

  /**
   * Get decrypted GitHub token from storage
   */
  async getDecryptedToken(integrationId: string): Promise<string> {
    const secret = await storage.getSecretByName(integrationId, 'github_token');
    if (!secret || !secret.isActive) {
      throw new Error('GitHub token not found or inactive');
    }

    const [encrypted, iv, authTag] = secret.encryptedValue.split(':');
    const token = this.decryptToken(encrypted, iv, authTag);

    // Update last accessed timestamp
    await storage.updateIntegrationSecret(secret.id, {
      lastAccessed: new Date(),
      accessCount: (secret.accessCount || 0) + 1
    });

    // Check if rotation is needed
    if (secret.rotationPolicy && (secret.rotationPolicy as any).enabled) {
      const lastRotated = new Date((secret.rotationPolicy as any).lastRotated || secret.createdAt);
      const daysSinceRotation = Math.floor((Date.now() - lastRotated.getTime()) / (1000 * 60 * 60 * 24));
      const intervalDays = (secret.rotationPolicy as any).intervalDays || 90;

      if (daysSinceRotation >= intervalDays) {
        // Token needs rotation - log for admin action
        await storage.createIntegrationAuditLog({
          integrationId,
          userId: null,
          action: 'rotation_needed',
          resourceType: 'secret',
          resourceId: secret.id,
          details: {
            secretName: secret.secretName,
            daysSinceRotation,
            message: 'OAuth token requires rotation'
          },
          risk: 'medium',
          complianceFlags: ['token-rotation-due'],
          metadata: {}
        });
      }
    }

    return token;
  }

  /**
   * Rotate GitHub OAuth token
   */
  async rotateToken(userId: string, integrationId: string, newToken: string): Promise<void> {
    const { encrypted, iv, authTag } = this.encryptToken(newToken);

    const existingSecret = await storage.getSecretByName(integrationId, 'github_token');
    if (existingSecret) {
      await storage.updateIntegrationSecret(existingSecret.id, {
        encryptedValue: `${encrypted}:${iv}:${authTag}`,
        lastRotated: new Date(),
        rotationPolicy: {
          ...(existingSecret.rotationPolicy as any || {}),
          lastRotated: new Date().toISOString()
        }
      });

      // Log rotation
      await storage.createIntegrationAuditLog({
        integrationId,
        userId,
        action: 'rotated',
        resourceType: 'secret',
        resourceId: existingSecret.id,
        details: {
          secretName: 'github_token',
          rotatedAt: new Date().toISOString()
        },
        risk: 'high',
        complianceFlags: ['manual-rotation'],
        metadata: {}
      });
    }
  }

  /**
   * List user's repositories
   */
  async listRepositories(token: string, type: 'all' | 'owner' | 'public' | 'private' = 'all'): Promise<GitHubRepository[]> {
    const octokit = this.getClient(token);

    const { data } = await octokit.repos.listForAuthenticatedUser({
      type,
      sort: 'updated',
      per_page: 100
    });

    return data as GitHubRepository[];
  }

  /**
   * Get repository details
   */
  async getRepository(token: string, owner: string, repo: string) {
    const octokit = this.getClient(token);
    const { data } = await octokit.repos.get({ owner, repo });
    return data;
  }

  /**
   * Get repository file contents
   */
  async getFileContents(token: string, owner: string, repo: string, path: string, ref?: string) {
    const octokit = this.getClient(token);

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(data)) {
        return data; // Directory listing
      }

      // Decode file content
      if ('content' in data && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { ...data, decodedContent: content };
      }

      return data;
    } catch (error) {
      console.error('Failed to get file contents:', error);
      throw error;
    }
  }

  /**
   * Detect framework from repository
   */
  async detectFramework(token: string, owner: string, repo: string): Promise<{
    framework: string;
    language: string;
    buildCommand?: string;
    startCommand?: string;
    port?: number;
  }> {
    const octokit = this.getClient(token);

    try {
      // Check for package.json
      const packageJson = await this.getFileContents(token, owner, repo, 'package.json');
      if (packageJson && 'decodedContent' in packageJson) {
        const pkg = JSON.parse(packageJson.decodedContent);

        // Detect framework from dependencies
        if (pkg.dependencies?.next || pkg.devDependencies?.next) {
          return {
            framework: 'next.js',
            language: 'typescript',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            port: 3000
          };
        }

        if (pkg.dependencies?.react || pkg.devDependencies?.react) {
          return {
            framework: 'react',
            language: 'typescript',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            port: 3000
          };
        }

        if (pkg.dependencies?.express) {
          return {
            framework: 'express',
            language: 'javascript',
            startCommand: 'npm start',
            port: 3000
          };
        }
      }

      // Check for requirements.txt (Python)
      try {
        const requirements = await this.getFileContents(token, owner, repo, 'requirements.txt');
        if (requirements) {
          return {
            framework: 'python',
            language: 'python',
            startCommand: 'python app.py',
            port: 8000
          };
        }
      } catch {
        // File doesn't exist
      }

      // Check for go.mod (Go)
      try {
        const goMod = await this.getFileContents(token, owner, repo, 'go.mod');
        if (goMod) {
          return {
            framework: 'go',
            language: 'go',
            buildCommand: 'go build',
            startCommand: './main',
            port: 8080
          };
        }
      } catch {
        // File doesn't exist
      }

      return {
        framework: 'unknown',
        language: 'unknown'
      };
    } catch (error) {
      console.error('Framework detection failed:', error);
      return {
        framework: 'unknown',
        language: 'unknown'
      };
    }
  }

  /**
   * Link repository to project
   */
  async linkRepository(
    userId: string,
    projectId: string,
    token: string,
    owner: string,
    repo: string
  ) {
    const octokit = this.getClient(token);

    // Get repository details
    const repoData = await this.getRepository(token, owner, repo);

    // Create GitHub integration
    const integration = await storage.createIntegration({
      userId,
      projectId,
      name: `GitHub - ${repoData.full_name}`,
      type: 'repository',
      service: 'github',
      category: 'development',
      connectionType: 'oauth',
      status: 'active',
      configuration: {
        owner,
        repo,
        defaultBranch: repoData.default_branch
      },
      endpoints: {
        api: 'https://api.github.com',
        repo: repoData.html_url
      },
      permissions: repoData.permissions || {},
      rateLimits: {},
      healthCheck: {
        enabled: true,
        interval: 600000 // 10 minutes
      },
      isEnabled: true,
      autoRotate: false,
      metadata: {
        language: repoData.language,
        private: repoData.private,
        size: repoData.size
      }
    });

    // Store encrypted token
    const { encrypted, iv, authTag } = this.encryptToken(token);
    await storage.createIntegrationSecret({
      integrationId: integration.id,
      secretType: 'oauth-token',
      secretName: 'github_token',
      encryptedValue: `${encrypted}:${iv}:${authTag}`,
      encryptionAlgorithm: 'AES-256-GCM',
      environment: 'all',
      scope: [],
      rotationPolicy: {
        enabled: true,
        intervalDays: 90,
        lastRotated: new Date().toISOString()
      },
      isActive: true,
      metadata: {
        tokenScopes: ['repo', 'read:org', 'user:email']
      }
    });

    // Create repository connection record
    const repoConnection = await storage.createRepositoryConnection({
      integrationId: integration.id,
      projectId,
      provider: 'github',
      repositoryId: String(repoData.id),
      repositoryName: repoData.name,
      repositoryUrl: repoData.html_url,
      ownerName: owner,
      ownerType: repoData.owner.type.toLowerCase(),
      defaultBranch: repoData.default_branch,
      syncBranches: [repoData.default_branch],
      deployKeys: [],
      permissions: repoData.permissions || {},
      autoSync: true,
      syncStatus: 'synced',
      conflictResolution: 'manual',
      isActive: true,
      metadata: {}
    });

    // Log the action
    await storage.createIntegrationAuditLog({
      integrationId: integration.id,
      userId,
      action: 'created',
      resourceType: 'connection',
      resourceId: repoConnection.id,
      details: {
        repository: repoData.full_name,
        owner,
        repo
      },
      risk: 'low',
      complianceFlags: [],
      metadata: {}
    });

    return { integration, repoConnection };
  }

  /**
   * Clone repository contents
   */
  async cloneRepository(token: string, owner: string, repo: string, branch?: string): Promise<Record<string, string>> {
    const octokit = this.getClient(token);
    const files: Record<string, string> = {};

    const repoData = await this.getRepository(token, owner, repo);
    const branchToUse = branch || repoData.default_branch;

    // Get repository tree
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branchToUse,
      recursive: 'true'
    });

    // Download all files (limit to reasonable size)
    const filesToDownload = tree.tree
      .filter(item => item.type === 'blob' && item.size && item.size < 1000000) // Max 1MB per file
      .slice(0, 100); // Max 100 files

    for (const file of filesToDownload) {
      if (!file.path) continue;

      try {
        const contents = await this.getFileContents(token, owner, repo, file.path, branchToUse);
        if (contents && 'decodedContent' in contents) {
          files[file.path] = contents.decodedContent;
        }
      } catch (error) {
        console.warn(`Failed to download ${file.path}:`, error);
      }
    }

    return files;
  }

  /**
   * Create webhook for repository
   */
  async createWebhook(
    token: string,
    owner: string,
    repo: string,
    webhookUrl: string,
    events: string[] = ['push', 'pull_request']
  ) {
    const octokit = this.getClient(token);

    const { data } = await octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        insecure_ssl: '0'
      },
      events,
      active: true
    });

    return data;
  }

  /**
   * Get repository branches
   */
  async getBranches(token: string, owner: string, repo: string) {
    const octokit = this.getClient(token);
    const { data } = await octokit.repos.listBranches({ owner, repo });
    return data;
  }

  /**
   * Get repository commits
   */
  async getCommits(token: string, owner: string, repo: string, branch?: string, limit = 10) {
    const octokit = this.getClient(token);
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: limit
    });
    return data;
  }
}

export const githubService = new GitHubService();
