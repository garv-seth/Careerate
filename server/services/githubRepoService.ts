/**
 * GitHub Repository Service
 * Handles cloning, analyzing, and building from GitHub repositories
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RepoAnalysis {
  framework: string;
  language: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'go' | 'cargo' | 'maven' | 'gradle';
  buildCommand?: string;
  startCommand?: string;
  port: number;
  envVars: string[];
  dependencies: Record<string, string>;
}

export class GitHubRepoService {
  private octokit: Octokit;
  private workDir: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_SECRET;

    if (!token) {
      console.warn('[GitHubRepoService] No GitHub token found, using unauthenticated API (rate-limited)');
    }

    this.octokit = new Octokit({
      auth: token
    });

    // Use temp directory for cloning repos
    this.workDir = path.join(process.cwd(), '.tmp', 'repos');
  }

  /**
   * Parse GitHub URL into owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\.]+)/,  // https://github.com/owner/repo
      /github\.com:([^\/]+)\/([^\/\.]+)/,   // git@github.com:owner/repo
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }

    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  /**
   * Clone repository to local directory
   */
  async cloneRepo(repoUrl: string): Promise<string> {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    const repoPath = path.join(this.workDir, owner, repo);

    // Clean up if already exists
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
    } catch {}

    // Create directory
    await fs.mkdir(repoPath, { recursive: true });

    console.log(`[GitHubRepoService] Cloning ${owner}/${repo}...`);

    // Clone with depth=1 for speed
    await execAsync(`git clone --depth 1 ${repoUrl} "${repoPath}"`);

    console.log(`[GitHubRepoService] ✅ Cloned to ${repoPath}`);
    return repoPath;
  }

  /**
   * Analyze repository structure and detect framework
   */
  async analyzeRepo(repoPath: string): Promise<RepoAnalysis> {
    console.log(`[GitHubRepoService] Analyzing repository...`);

    const files = await fs.readdir(repoPath);

    // Detect framework and language
    let framework = 'unknown';
    let language = 'unknown';
    let packageManager: RepoAnalysis['packageManager'] = 'npm';
    let port = 3000;
    let buildCommand = '';
    let startCommand = '';
    let envVars: string[] = [];
    let dependencies: Record<string, string> = {};

    // Node.js / JavaScript / TypeScript
    if (files.includes('package.json')) {
      language = 'javascript';
      const packageJson = JSON.parse(
        await fs.readFile(path.join(repoPath, 'package.json'), 'utf-8')
      );

      dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Detect framework
      if (dependencies['next']) {
        framework = 'Next.js';
        buildCommand = 'npm run build';
        startCommand = 'npm start';
        port = 3000;
      } else if (dependencies['react']) {
        framework = 'React';
        buildCommand = 'npm run build';
        startCommand = 'npm start';
        port = 3000;
      } else if (dependencies['vue']) {
        framework = 'Vue.js';
        buildCommand = 'npm run build';
        startCommand = 'npm start';
        port = 8080;
      } else if (dependencies['express']) {
        framework = 'Express.js';
        buildCommand = 'npm run build';
        startCommand = 'npm start';
        port = 3000;
      } else if (dependencies['@nestjs/core']) {
        framework = 'NestJS';
        buildCommand = 'npm run build';
        startCommand = 'npm run start:prod';
        port = 3000;
      } else {
        framework = 'Node.js';
        buildCommand = packageJson.scripts?.build || '';
        startCommand = packageJson.scripts?.start || 'node index.js';
        port = 3000;
      }

      // Detect package manager
      if (files.includes('pnpm-lock.yaml')) {
        packageManager = 'pnpm';
        buildCommand = buildCommand.replace('npm', 'pnpm');
        startCommand = startCommand.replace('npm', 'pnpm');
      } else if (files.includes('yarn.lock')) {
        packageManager = 'yarn';
        buildCommand = buildCommand.replace('npm', 'yarn');
        startCommand = startCommand.replace('npm', 'yarn');
      }

      // Extract environment variables from .env.example
      if (files.includes('.env.example')) {
        const envExample = await fs.readFile(path.join(repoPath, '.env.example'), 'utf-8');
        envVars = envExample.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.split('=')[0].trim());
      }
    }

    // Python
    else if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
      language = 'python';
      packageManager = 'pip';

      if (files.includes('manage.py')) {
        framework = 'Django';
        buildCommand = 'pip install -r requirements.txt';
        startCommand = 'python manage.py runserver';
        port = 8000;
      } else if (files.includes('app.py')) {
        framework = 'Flask';
        buildCommand = 'pip install -r requirements.txt';
        startCommand = 'python app.py';
        port = 5000;
      } else {
        framework = 'Python';
        buildCommand = 'pip install -r requirements.txt';
        startCommand = 'python main.py';
        port = 8000;
      }
    }

    // Go
    else if (files.includes('go.mod')) {
      language = 'go';
      framework = 'Go';
      packageManager = 'go';
      buildCommand = 'go build';
      startCommand = './main';
      port = 8080;
    }

    // Rust
    else if (files.includes('Cargo.toml')) {
      language = 'rust';
      framework = 'Rust';
      packageManager = 'cargo';
      buildCommand = 'cargo build --release';
      startCommand = './target/release/main';
      port = 8080;
    }

    console.log(`[GitHubRepoService] ✅ Detected: ${framework} (${language})`);

    return {
      framework,
      language,
      packageManager,
      buildCommand,
      startCommand,
      port,
      envVars,
      dependencies
    };
  }

  /**
   * Generate Dockerfile for repository
   */
  async generateDockerfile(repoPath: string, analysis: RepoAnalysis): Promise<string> {
    let dockerfile = '';

    // Node.js Dockerfile
    if (analysis.language === 'javascript') {
      dockerfile = `
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
${analysis.packageManager === 'yarn' ? 'COPY yarn.lock ./' : ''}
${analysis.packageManager === 'pnpm' ? 'COPY pnpm-lock.yaml ./' : ''}

# Install dependencies
RUN ${analysis.packageManager === 'pnpm' ? 'npm install -g pnpm && pnpm install' :
      analysis.packageManager === 'yarn' ? 'yarn install --frozen-lockfile' :
      'npm ci'}

# Copy source code
COPY . .

# Build application
${analysis.buildCommand ? `RUN ${analysis.buildCommand}` : '# No build command'}

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy from builder
COPY --from=builder /app .

# Expose port
EXPOSE ${analysis.port}

# Start application
CMD [${analysis.startCommand.split(' ').map(s => `"${s}"`).join(', ')}]
`.trim();
    }

    // Python Dockerfile
    else if (analysis.language === 'python') {
      dockerfile = `
FROM python:3.11-slim
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE ${analysis.port}

# Start application
CMD [${analysis.startCommand.split(' ').map(s => `"${s}"`).join(', ')}]
`.trim();
    }

    // Go Dockerfile
    else if (analysis.language === 'go') {
      dockerfile = `
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

# Production stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE ${analysis.port}
CMD ["./main"]
`.trim();
    }

    // Rust Dockerfile
    else if (analysis.language === 'rust') {
      dockerfile = `
# Build stage
FROM rust:1.75-alpine AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

# Production stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/target/release/main .
EXPOSE ${analysis.port}
CMD ["./main"]
`.trim();
    }

    const dockerfilePath = path.join(repoPath, 'Dockerfile.generated');
    await fs.writeFile(dockerfilePath, dockerfile);

    console.log(`[GitHubRepoService] ✅ Generated Dockerfile`);
    return dockerfilePath;
  }

  /**
   * Cleanup cloned repository
   */
  async cleanup(repoPath: string): Promise<void> {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
      console.log(`[GitHubRepoService] 🗑️  Cleaned up ${repoPath}`);
    } catch (error) {
      console.error(`[GitHubRepoService] Failed to cleanup ${repoPath}:`, error);
    }
  }
}
