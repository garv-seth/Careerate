/**
 * Base Cloud Provider
 * 
 * Abstract class for AWS, Azure, and GCP providers
 * Defines common interface for cloud operations
 */

import { agentLogger } from '../../agents/kernel.config';

export interface CloudCredentials {
  // AWS
  roleArn?: string;
  externalId?: string;
  region?: string;

  // Azure
  tenantId?: string;
  subscriptionId?: string;
  clientId?: string;
  clientSecret?: string;

  // GCP
  projectId?: string;
  serviceAccountKey?: any;

  // Common
  [key: string]: any;
}

export interface DeploymentConfig {
  name: string;
  framework: string;
  repositoryUrl?: string;
  buildCommand?: string;
  startCommand?: string;
  environmentVariables?: Record<string, string>;
  region: string;
  instanceType?: string;
  autoScaling?: {
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
  };
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  url?: string;
  logs?: string[];
  error?: string;
}

export interface InfrastructureTemplate {
  format: 'cloudformation' | 'arm' | 'terraform';
  content: string | object;
  resources: Array<{
    type: string;
    name: string;
    properties: any;
  }>;
}

/**
 * Abstract Base Cloud Provider
 */
export abstract class BaseCloudProvider {
  protected providerName: string;
  protected credentials: CloudCredentials;

  constructor(providerName: string, credentials: CloudCredentials) {
    this.providerName = providerName;
    this.credentials = credentials;
    
    agentLogger.info(`${providerName} provider initialized`);
  }

  /**
   * Validate credentials
   */
  abstract validateCredentials(): Promise<boolean>;

  /**
   * Deploy application
   */
  abstract deploy(config: DeploymentConfig): Promise<DeploymentResult>;

  /**
   * Get deployment status
   */
  abstract getDeploymentStatus(deploymentId: string): Promise<{
    status: 'deploying' | 'running' | 'failed' | 'stopped';
    url?: string;
    health?: 'healthy' | 'unhealthy';
  }>;

  /**
   * Scale deployment
   */
  abstract scale(deploymentId: string, instances: number): Promise<void>;

  /**
   * Stop deployment
   */
  abstract stop(deploymentId: string): Promise<void>;

  /**
   * Delete deployment
   */
  abstract delete(deploymentId: string): Promise<void>;

  /**
   * Export deployment as Infrastructure as Code
   */
  abstract exportAsIaC(deploymentId: string): Promise<InfrastructureTemplate>;

  /**
   * Revoke Careerate's access (ejection)
   */
  abstract revokeAccess(): Promise<void>;

  /**
   * Get estimated monthly cost
   */
  abstract estimateCost(config: DeploymentConfig): Promise<{
    monthly: number; // in cents
    breakdown: {
      compute: number;
      database?: number;
      storage?: number;
      bandwidth?: number;
      other?: number;
    };
  }>;

  /**
   * Get provider name
   */
  getProviderName(): string {
    return this.providerName;
  }
}

