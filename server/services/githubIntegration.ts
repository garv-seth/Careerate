/**
 * GITHUB INTEGRATION SERVICE
 * Real GitHub API integration for repo cloning and webhook handling
 */

import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { exec } from "child_process";
import { promisify } from "util";
import { storage } from "../storage";
import crypto from "crypto";

const execAsync = promisify(exec);

interface GitHubRepo {
  owner: string;
  repo: string;
  branch?: string;
  accessToken: string;
}

interface RepoAnalysis {
  framework: string;
  language: string;
  hasDockerfile: boolean;
  hasPackageJson: boolean;
  dependencies: Record<string, string>;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
}

export class GitHubIntegrationService {
  private octokit: Octokit | null = null;

  constructor() {
    const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_SECRET;

    if (githubToken) {
      this.octokit = new Octokit({
        auth: githubToken
      });
      console.log('✅ GitHub Integration Service initialized');
    } else {
      console.warn('⚠️  GitHub token not found - GitHub integration will be limited');
    }
  }

  /**
   * Clone a GitHub repository
   */
  async cloneRepo(repoUrl: string, targetDir: string, accessToken?: string): Promise<string> {
    try {
      console.log(`📥 Cloning repository: ${repoUrl}`);

      // Add auth token to URL if provided
      let cloneUrl = repoUrl;
      if (accessToken) {
        cloneUrl = repoUrl.replace('https://', `https://${accessToken}@`);
      }

      // Clone the repository
      await execAsync(`git clone ${cloneUrl} ${targetDir}`, {
        timeout: 300000 // 5 minute timeout
      });

      console.log(`✅ Repository cloned successfully to ${targetDir}`);
      return targetDir;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze repository structure and detect framework
   */
  async analyzeRepo(repoPath: string): Promise<RepoAnalysis> {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      console.log(`🔍 Analyzing repository at ${repoPath}`);

      const analysis: RepoAnalysis = {
        framework: 'unknown',
        language: 'javascript',
        hasDockerfile: false,
        hasPackageJson: false,
        dependencies: {}
      };

      // Check for Dockerfile
      try {
        await fs.access(path.join(repoPath, 'Dockerfile'));
        analysis.hasDockerfile = true;
      } catch {}

      // Check for package.json (Node.js project)
      try {
        const packageJsonPath = path.join(repoPath, 'package.json');
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);

        analysis.hasPackageJson = true;
        analysis.dependencies = packageJson.dependencies || {};

        // Detect framework
        if (packageJson.dependencies?.next) {
          analysis.framework = 'nextjs';
          analysis.buildCommand = 'npm run build';
          analysis.startCommand = 'npm start';
          analysis.port = 3000;
        } else if (packageJson.dependencies?.react) {
          analysis.framework = 'react';
          analysis.buildCommand = 'npm run build';
          analysis.startCommand = 'npm start';
          analysis.port = 3000;
        } else if (packageJson.dependencies?.express) {
          analysis.framework = 'express';
          analysis.buildCommand = 'npm install';
          analysis.startCommand = 'node server.js';
          analysis.port = 3000;
        } else if (packageJson.dependencies?.vue) {
          analysis.framework = 'vue';
          analysis.buildCommand = 'npm run build';
          analysis.startCommand = 'npm start';
          analysis.port = 8080;
        }

        // Check scripts for clues
        if (packageJson.scripts?.start) {
          analysis.startCommand = 'npm start';
        }
        if (packageJson.scripts?.build) {
          analysis.buildCommand = 'npm run build';
        }

      } catch {
        console.log('No package.json found, checking for other languages...');
      }

      // Check for Python projects
      try {
        await fs.access(path.join(repoPath, 'requirements.txt'));
        analysis.language = 'python';
        analysis.framework = 'python';

        // Check for Flask or FastAPI
        const requirements = await fs.readFile(path.join(repoPath, 'requirements.txt'), 'utf-8');
        if (requirements.includes('flask')) {
          analysis.framework = 'flask';
          analysis.startCommand = 'python app.py';
          analysis.port = 5000;
        } else if (requirements.includes('fastapi')) {
          analysis.framework = 'fastapi';
          analysis.startCommand = 'uvicorn main:app --host 0.0.0.0 --port 8000';
          analysis.port = 8000;
        }
      } catch {}

      console.log(`✅ Repository analysis complete:`, analysis);
      return analysis;

    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get repository contents via GitHub API
   */
  async getRepoContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });

      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      throw new Error(`Failed to get repo contents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Download file from repository
   */
  async downloadFile(owner: string, repo: string, path: string): Promise<string> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });

      if ('content' in response.data && response.data.content) {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }

      throw new Error('File content not available');
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Setup webhook for repository
   */
  async setupWebhook(owner: string, repo: string, webhookUrl: string, secret: string): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      // Check if webhook already exists
      const { data: hooks } = await this.octokit.repos.listWebhooks({
        owner,
        repo
      });

      const existingHook = hooks.find(hook => hook.config.url === webhookUrl);

      if (existingHook) {
        console.log(`Webhook already exists for ${owner}/${repo}`);
        return existingHook;
      }

      // Create new webhook
      const { data: hook } = await this.octokit.repos.createWebhook({
        owner,
        repo,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret,
          insecure_ssl: '0'
        },
        events: ['push', 'pull_request']
      });

      console.log(`✅ Webhook created for ${owner}/${repo}`);
      return hook;

    } catch (error) {
      throw new Error(`Failed to setup webhook: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  /**
   * Parse repository URL into owner and repo
   */
  parseRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
    try {
      // Handle various GitHub URL formats
      // https://github.com/owner/repo
      // git@github.com:owner/repo.git
      // github.com/owner/repo

      let url = repoUrl.trim();

      // Remove .git suffix
      url = url.replace(/\.git$/, '');

      // Handle SSH format
      if (url.startsWith('git@github.com:')) {
        url = url.replace('git@github.com:', '');
      } else {
        // Remove protocol and github.com
        url = url.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '');
      }

      const parts = url.split('/');
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1]
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepos(accessToken: string): Promise<any[]> {
    const userOctokit = new Octokit({ auth: accessToken });

    try {
      const { data: repos } = await userOctokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100
      });

      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        description: repo.description,
        url: repo.html_url,
        clone_url: repo.clone_url,
        language: repo.language,
        updated_at: repo.updated_at
      }));

    } catch (error) {
      throw new Error(`Failed to get user repos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get latest commit for a branch
   */
  async getLatestCommit(owner: string, repo: string, branch: string = 'main'): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data: commit } = await this.octokit.repos.getCommit({
        owner,
        repo,
        ref: branch
      });

      return {
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        url: commit.html_url
      };

    } catch (error) {
      // Try 'master' branch if 'main' fails
      if (branch === 'main') {
        return this.getLatestCommit(owner, repo, 'master');
      }
      throw new Error(`Failed to get latest commit: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Singleton instance
export const githubIntegration = new GitHubIntegrationService();