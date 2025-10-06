/**
 * Tech Stack Auto-Detection Service
 * Analyzes repositories to detect frameworks, languages, and dependencies
 */

export interface TechStackAnalysis {
  framework: string;
  language: string;
  packageManager: string;
  buildCommand: string;
  startCommand: string;
  installCommand: string;
  port: number;
  environmentVariables: string[];
  dependencies: {
    production: string[];
    development: string[];
  };
  dockerfile?: string;
  confidence: number;
  recommendations: string[];
}

class TechStackDetector {
  /**
   * Detect tech stack from repository files
   */
  async detectFromRepository(
    files: Record<string, string>
  ): Promise<TechStackAnalysis> {
    const fileNames = Object.keys(files);

    // Check for package.json (Node.js)
    if (fileNames.includes('package.json')) {
      return this.analyzeNodeJs(files);
    }

    // Check for requirements.txt (Python)
    if (fileNames.includes('requirements.txt') || fileNames.includes('Pipfile')) {
      return this.analyzePython(files);
    }

    // Check for go.mod (Go)
    if (fileNames.includes('go.mod')) {
      return this.analyzeGo(files);
    }

    // Check for Cargo.toml (Rust)
    if (fileNames.includes('Cargo.toml')) {
      return this.analyzeRust(files);
    }

    // Check for pom.xml or build.gradle (Java)
    if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) {
      return this.analyzeJava(files);
    }

    // Default/unknown stack
    return {
      framework: 'unknown',
      language: 'unknown',
      packageManager: 'unknown',
      buildCommand: '',
      startCommand: '',
      installCommand: '',
      port: 3000,
      environmentVariables: [],
      dependencies: { production: [], development: [] },
      confidence: 0,
      recommendations: ['Could not detect tech stack. Please provide deployment configuration manually.']
    };
  }

  /**
   * Analyze Node.js project
   */
  private analyzeNodeJs(files: Record<string, string>): TechStackAnalysis {
    const packageJson = JSON.parse(files['package.json'] || '{}');
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    let framework = 'node';
    let buildCommand = packageJson.scripts?.build || 'npm run build';
    let startCommand = packageJson.scripts?.start || 'npm start';
    let port = 3000;
    const recommendations: string[] = [];

    // Detect framework
    if (dependencies['react'] || devDependencies['react']) {
      framework = 'react';
      port = 3000;
      if (dependencies['next']) {
        framework = 'next';
        buildCommand = 'next build';
        startCommand = 'next start';
        recommendations.push('Next.js detected - recommended for Vercel deployment');
      } else if (files['vite.config.js'] || files['vite.config.ts']) {
        framework = 'vite';
        buildCommand = 'vite build';
        startCommand = 'vite preview';
        recommendations.push('Vite detected - fast builds and hot reload');
      }
    } else if (dependencies['vue']) {
      framework = 'vue';
      port = 3000;
    } else if (dependencies['@angular/core']) {
      framework = 'angular';
      port = 4200;
    } else if (dependencies['express']) {
      framework = 'express';
      port = 3000;
      recommendations.push('Express.js backend detected');
    } else if (dependencies['fastify']) {
      framework = 'fastify';
      port = 3000;
      recommendations.push('Fastify backend detected - high performance');
    } else if (dependencies['nestjs']) {
      framework = 'nestjs';
      port = 3000;
      recommendations.push('NestJS detected - enterprise-grade framework');
    }

    // Extract environment variables from example files
    const envVariables: string[] = [];
    if (files['.env.example']) {
      const envLines = files['.env.example'].split('\n');
      envVariables.push(...envLines
        .filter(line => line.includes('='))
        .map(line => line.split('=')[0].trim())
      );
    }

    return {
      framework,
      language: 'javascript',
      packageManager: files['yarn.lock'] ? 'yarn' : files['pnpm-lock.yaml'] ? 'pnpm' : 'npm',
      buildCommand,
      startCommand,
      installCommand: files['yarn.lock'] ? 'yarn install' : files['pnpm-lock.yaml'] ? 'pnpm install' : 'npm install',
      port,
      environmentVariables: envVariables,
      dependencies: {
        production: Object.keys(dependencies),
        development: Object.keys(devDependencies)
      },
      confidence: 0.95,
      recommendations
    };
  }

  /**
   * Analyze Python project
   */
  private analyzePython(files: Record<string, string>): TechStackAnalysis {
    const requirements = files['requirements.txt'] || '';
    const dependencies = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    let framework = 'python';
    let startCommand = 'python app.py';
    const recommendations: string[] = [];

    if (dependencies.some(dep => dep.includes('django'))) {
      framework = 'django';
      startCommand = 'python manage.py runserver';
      recommendations.push('Django detected - full-featured web framework');
    } else if (dependencies.some(dep => dep.includes('flask'))) {
      framework = 'flask';
      startCommand = 'flask run';
      recommendations.push('Flask detected - lightweight web framework');
    } else if (dependencies.some(dep => dep.includes('fastapi'))) {
      framework = 'fastapi';
      startCommand = 'uvicorn main:app --host 0.0.0.0';
      recommendations.push('FastAPI detected - modern, high-performance API framework');
    }

    return {
      framework,
      language: 'python',
      packageManager: files['Pipfile'] ? 'pipenv' : 'pip',
      buildCommand: '',
      startCommand,
      installCommand: files['Pipfile'] ? 'pipenv install' : 'pip install -r requirements.txt',
      port: 8000,
      environmentVariables: [],
      dependencies: {
        production: dependencies,
        development: []
      },
      confidence: 0.9,
      recommendations
    };
  }

  /**
   * Analyze Go project
   */
  private analyzeGo(files: Record<string, string>): TechStackAnalysis {
    return {
      framework: 'go',
      language: 'go',
      packageManager: 'go',
      buildCommand: 'go build -o app',
      startCommand: './app',
      installCommand: 'go mod download',
      port: 8080,
      environmentVariables: [],
      dependencies: { production: [], development: [] },
      confidence: 0.95,
      recommendations: ['Go detected - compiled, high-performance language']
    };
  }

  /**
   * Analyze Rust project
   */
  private analyzeRust(files: Record<string, string>): TechStackAnalysis {
    return {
      framework: 'rust',
      language: 'rust',
      packageManager: 'cargo',
      buildCommand: 'cargo build --release',
      startCommand: './target/release/app',
      installCommand: 'cargo fetch',
      port: 8080,
      environmentVariables: [],
      dependencies: { production: [], development: [] },
      confidence: 0.95,
      recommendations: ['Rust detected - memory-safe, high-performance language']
    };
  }

  /**
   * Analyze Java project
   */
  private analyzeJava(files: Record<string, string>): TechStackAnalysis {
    const isMaven = 'pom.xml' in files;
    const isGradle = 'build.gradle' in files;

    return {
      framework: 'spring-boot',
      language: 'java',
      packageManager: isMaven ? 'maven' : 'gradle',
      buildCommand: isMaven ? 'mvn package' : 'gradle build',
      startCommand: 'java -jar target/app.jar',
      installCommand: isMaven ? 'mvn install' : 'gradle dependencies',
      port: 8080,
      environmentVariables: [],
      dependencies: { production: [], development: [] },
      confidence: 0.85,
      recommendations: ['Java detected - enterprise-grade platform']
    };
  }

  /**
   * Generate Dockerfile based on detected stack
   */
  generateDockerfile(analysis: TechStackAnalysis): string {
    switch (analysis.language) {
      case 'javascript':
        return this.generateNodeDockerfile(analysis);
      case 'python':
        return this.generatePythonDockerfile(analysis);
      case 'go':
        return this.generateGoDockerfile(analysis);
      default:
        return this.generateGenericDockerfile(analysis);
    }
  }

  private generateNodeDockerfile(analysis: TechStackAnalysis): string {
    const pkgManager = analysis.packageManager;
    const installCmd = pkgManager === 'yarn' ? 'yarn' : pkgManager === 'pnpm' ? 'pnpm install --frozen-lockfile' : 'npm ci';
    const buildCmd = analysis.buildCommand || 'npm run build';

    return `# Auto-generated Dockerfile for ${analysis.framework}
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
${pkgManager === 'yarn' ? 'COPY yarn.lock ./' : ''}
${pkgManager === 'pnpm' ? 'COPY pnpm-lock.yaml ./' : ''}

# Install dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Build application
RUN ${buildCmd}

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE ${analysis.port}

# Start application
CMD ["${analysis.startCommand}"]
`;
  }

  private generatePythonDockerfile(analysis: TechStackAnalysis): string {
    return `# Auto-generated Dockerfile for ${analysis.framework}
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE ${analysis.port}

# Start application
CMD ["${analysis.startCommand}"]
`;
  }

  private generateGoDockerfile(analysis: TechStackAnalysis): string {
    return `# Auto-generated Dockerfile for Go
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.* ./
RUN go mod download

# Copy source
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o app

# Production image
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/app .

EXPOSE ${analysis.port}

CMD ["./app"]
`;
  }

  private generateGenericDockerfile(analysis: TechStackAnalysis): string {
    return `# Generic Dockerfile
FROM debian:bullseye-slim

WORKDIR /app

COPY . .

EXPOSE ${analysis.port}

CMD ["${analysis.startCommand}"]
`;
  }
}

export const techStackDetector = new TechStackDetector();
