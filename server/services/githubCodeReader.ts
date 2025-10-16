/**
 * GitHub Code Reader Service
 * Allows agents to read code from connected GitHub repositories
 */

import { storage } from '../storage';
import { encryptionService } from './encryptionService';

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
  url?: string;
  content?: string;
}

export interface GitHubRepository {
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  description?: string;
  language?: string;
}

export class GitHubCodeReaderService {
  /**
   * Get repository structure (file tree)
   */
  async getRepositoryStructure(
    repositoryConnectionId: string,
    path: string = '',
    branch?: string
  ): Promise<GitHubFile[]> {
    const repoConnection = await storage.getRepositoryConnection(repositoryConnectionId);

    if (!repoConnection) {
      throw new Error('Repository connection not found');
    }

    const accessToken = await this.getAccessToken(repoConnection.integrationId);
    const defaultBranch = branch || repoConnection.defaultBranch || 'main';

    // GitHub API: Get contents of a directory
    const apiUrl = `https://api.github.com/repos/${repoConnection.ownerName}/${repoConnection.repositoryName}/contents/${path}?ref=${defaultBranch}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Careerate-Agent'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const files = await response.json();

    return Array.isArray(files) ? files.map((file: any) => ({
      name: file.name,
      path: file.path,
      type: file.type === 'dir' ? 'dir' : 'file',
      size: file.size,
      sha: file.sha,
      url: file.download_url
    })) : [];
  }

  /**
   * Read file contents from repository
   */
  async readFile(
    repositoryConnectionId: string,
    filePath: string,
    branch?: string
  ): Promise<string> {
    const repoConnection = await storage.getRepositoryConnection(repositoryConnectionId);

    if (!repoConnection) {
      throw new Error('Repository connection not found');
    }

    const accessToken = await this.getAccessToken(repoConnection.integrationId);
    const defaultBranch = branch || repoConnection.defaultBranch || 'main';

    // GitHub API: Get file contents
    const apiUrl = `https://api.github.com/repos/${repoConnection.ownerName}/${repoConnection.repositoryName}/contents/${filePath}?ref=${defaultBranch}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Careerate-Agent'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const file = await response.json();

    if (file.type !== 'file') {
      throw new Error('Path is not a file');
    }

    // Decode base64 content
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    return content;
  }

  /**
   * Read multiple files at once
   */
  async readMultipleFiles(
    repositoryConnectionId: string,
    filePaths: string[],
    branch?: string
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          const content = await this.readFile(repositoryConnectionId, filePath, branch);
          results[filePath] = content;
        } catch (error) {
          console.error(`Failed to read ${filePath}:`, error);
          results[filePath] = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      })
    );

    return results;
  }

  /**
   * Analyze repository (get package.json, dependencies, framework info)
   */
  async analyzeRepository(repositoryConnectionId: string): Promise<{
    framework?: string;
    language?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    packageManager?: string;
    buildCommand?: string;
    startCommand?: string;
  }> {
    const analysis: any = {};

    try {
      // Try to read package.json
      const packageJson = await this.readFile(repositoryConnectionId, 'package.json');
      const pkg = JSON.parse(packageJson);

      analysis.dependencies = pkg.dependencies || {};
      analysis.devDependencies = pkg.devDependencies || {};
      analysis.buildCommand = pkg.scripts?.build;
      analysis.startCommand = pkg.scripts?.start;

      // Detect framework
      if (pkg.dependencies?.['next']) {
        analysis.framework = 'nextjs';
      } else if (pkg.dependencies?.['react']) {
        analysis.framework = 'react';
      } else if (pkg.dependencies?.['vue']) {
        analysis.framework = 'vue';
      } else if (pkg.dependencies?.['@angular/core']) {
        analysis.framework = 'angular';
      } else if (pkg.dependencies?.['express']) {
        analysis.framework = 'express';
      } else if (pkg.dependencies?.['fastify']) {
        analysis.framework = 'fastify';
      }

      analysis.language = 'javascript';

      // Check for TypeScript
      if (pkg.devDependencies?.['typescript'] || pkg.dependencies?.['typescript']) {
        analysis.language = 'typescript';
      }
    } catch (error) {
      console.log('No package.json found or error reading it');
    }

    // Check for requirements.txt (Python)
    try {
      const requirements = await this.readFile(repositoryConnectionId, 'requirements.txt');
      analysis.language = 'python';
      analysis.framework = 'python';
    } catch {
      // No Python detected
    }

    // Check for go.mod (Go)
    try {
      const goMod = await this.readFile(repositoryConnectionId, 'go.mod');
      analysis.language = 'go';
      analysis.framework = 'go';
    } catch {
      // No Go detected
    }

    return analysis;
  }

  /**
   * Get access token for GitHub integration
   */
  private async getAccessToken(integrationId: string): Promise<string> {
    const secrets = await storage.getIntegrationSecrets(integrationId);
    const accessTokenSecret = secrets.find(s => s.secretName === 'accessToken');

    if (!accessTokenSecret) {
      throw new Error('No GitHub access token found');
    }

    // Decrypt the token
    const accessToken = await encryptionService.decryptCredentials(accessTokenSecret.encryptedValue);

    if (typeof accessToken === 'object' && 'token' in accessToken) {
      return accessToken.token;
    }

    return String(accessToken);
  }

  /**
   * Get branches for a repository
   */
  async getBranches(repositoryConnectionId: string): Promise<string[]> {
    const repoConnection = await storage.getRepositoryConnection(repositoryConnectionId);

    if (!repoConnection) {
      throw new Error('Repository connection not found');
    }

    const accessToken = await this.getAccessToken(repoConnection.integrationId);

    const apiUrl = `https://api.github.com/repos/${repoConnection.ownerName}/${repoConnection.repositoryName}/branches`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Careerate-Agent'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const branches = await response.json();
    return branches.map((b: any) => b.name);
  }

  /**
   * Search for files in repository
   */
  async searchFiles(
    repositoryConnectionId: string,
    query: string
  ): Promise<GitHubFile[]> {
    const repoConnection = await storage.getRepositoryConnection(repositoryConnectionId);

    if (!repoConnection) {
      throw new Error('Repository connection not found');
    }

    const accessToken = await this.getAccessToken(repoConnection.integrationId);

    // GitHub Code Search API
    const searchQuery = `${query}+repo:${repoConnection.ownerName}/${repoConnection.repositoryName}`;
    const apiUrl = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Careerate-Agent'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const results = await response.json();

    return results.items.map((item: any) => ({
      name: item.name,
      path: item.path,
      type: 'file' as const,
      url: item.html_url
    }));
  }
}

export const githubCodeReader = new GitHubCodeReaderService();
