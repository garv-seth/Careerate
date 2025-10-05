/**
 * Agent Tool Definitions for OpenAI Function Calling
 *
 * These tools allow the Cara agent to:
 * - Analyze repositories
 * - Suggest deployment architectures
 * - Calculate costs
 * - Deploy to various cloud providers
 * - Provision databases
 * - Set up monitoring
 */

import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const agentTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'analyze_repository',
      description: 'Analyze a GitHub repository to detect framework, runtime, dependencies, and build requirements',
      parameters: {
        type: 'object',
        properties: {
          repositoryUrl: {
            type: 'string',
            description: 'GitHub repository URL (e.g., https://github.com/user/repo)'
          }
        },
        required: ['repositoryUrl']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_deployment_architecture',
      description: 'Suggest optimal cloud provider and architecture based on app requirements and constraints',
      parameters: {
        type: 'object',
        properties: {
          framework: {
            type: 'string',
            description: 'Detected framework (nextjs, react, express, django, etc.)'
          },
          needsDatabase: {
            type: 'boolean',
            description: 'Whether app requires a database'
          },
          databaseType: {
            type: 'string',
            description: 'Type of database if needed (postgresql, mongodb, redis, mysql)',
            enum: ['postgresql', 'mongodb', 'redis', 'mysql', 'none']
          },
          expectedTraffic: {
            type: 'string',
            description: 'Expected monthly traffic',
            enum: ['low', 'medium', 'high']
          },
          budgetConstraint: {
            type: 'number',
            description: 'Maximum monthly budget in USD'
          },
          regionalRequirements: {
            type: 'string',
            description: 'Regional constraints (e.g., "EU only", "global", "US only")'
          }
        },
        required: ['framework']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate_cost_estimate',
      description: 'Calculate estimated monthly cost for a proposed deployment architecture',
      parameters: {
        type: 'object',
        properties: {
          provider: {
            type: 'string',
            description: 'Cloud provider',
            enum: ['aws', 'azure', 'gcp', 'vercel', 'railway']
          },
          services: {
            type: 'array',
            description: 'List of services to include in cost estimate',
            items: {
              type: 'object',
              properties: {
                service: {
                  type: 'string',
                  description: 'Service name (e.g., "compute", "database", "cdn")'
                },
                tier: {
                  type: 'string',
                  description: 'Service tier (e.g., "basic", "standard", "premium")'
                }
              }
            }
          },
          expectedTraffic: {
            type: 'string',
            enum: ['low', 'medium', 'high']
          }
        },
        required: ['provider', 'services', 'expectedTraffic']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'deploy_to_azure_container_apps',
      description: 'Deploy application to Azure Container Apps (production-ready, auto-scaling)',
      parameters: {
        type: 'object',
        properties: {
          appName: {
            type: 'string',
            description: 'Application name (lowercase, alphanumeric, hyphens only)'
          },
          githubRepoUrl: {
            type: 'string',
            description: 'GitHub repository URL'
          },
          environmentVariables: {
            type: 'object',
            description: 'Environment variables as key-value pairs',
            additionalProperties: { type: 'string' }
          },
          minReplicas: {
            type: 'number',
            description: 'Minimum number of replicas (0 for scale-to-zero)',
            default: 1
          },
          maxReplicas: {
            type: 'number',
            description: 'Maximum number of replicas',
            default: 10
          }
        },
        required: ['appName', 'githubRepoUrl']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'deploy_to_vercel',
      description: 'Deploy frontend application to Vercel (optimized for Next.js, React, static sites)',
      parameters: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Project name'
          },
          githubRepoUrl: {
            type: 'string',
            description: 'GitHub repository URL'
          },
          framework: {
            type: 'string',
            description: 'Framework',
            enum: ['nextjs', 'react', 'vue', 'svelte', 'static']
          },
          environmentVariables: {
            type: 'object',
            description: 'Environment variables',
            additionalProperties: { type: 'string' }
          }
        },
        required: ['projectName', 'githubRepoUrl', 'framework']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'provision_neon_database',
      description: 'Create a serverless PostgreSQL database on Neon (scales to zero when idle)',
      parameters: {
        type: 'object',
        properties: {
          databaseName: {
            type: 'string',
            description: 'Database name'
          },
          region: {
            type: 'string',
            description: 'AWS region for database',
            enum: ['aws-us-west-2', 'aws-us-east-1', 'aws-eu-central-1', 'aws-ap-southeast-1']
          }
        },
        required: ['databaseName', 'region']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'provision_mongodb_atlas',
      description: 'Create a MongoDB cluster on MongoDB Atlas',
      parameters: {
        type: 'object',
        properties: {
          clusterName: {
            type: 'string',
            description: 'Cluster name'
          },
          tier: {
            type: 'string',
            description: 'Cluster tier',
            enum: ['M0', 'M2', 'M5', 'M10', 'M20']
          },
          region: {
            type: 'string',
            description: 'Cloud region',
            enum: ['US_EAST_1', 'US_WEST_2', 'EU_WEST_1', 'AP_SOUTHEAST_1']
          }
        },
        required: ['clusterName', 'tier', 'region']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'setup_datadog_monitoring',
      description: 'Configure Datadog APM and logging for deployed application',
      parameters: {
        type: 'object',
        properties: {
          serviceName: {
            type: 'string',
            description: 'Service name for monitoring'
          },
          environment: {
            type: 'string',
            description: 'Environment (production, staging, etc.)',
            enum: ['production', 'staging', 'development']
          },
          enableAPM: {
            type: 'boolean',
            description: 'Enable Application Performance Monitoring',
            default: true
          },
          enableLogs: {
            type: 'boolean',
            description: 'Enable log collection',
            default: true
          }
        },
        required: ['serviceName', 'environment']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'send_deployment_notification',
      description: 'Send deployment completion notification via Slack or email',
      parameters: {
        type: 'object',
        properties: {
          channel: {
            type: 'string',
            description: 'Notification channel',
            enum: ['slack', 'email']
          },
          message: {
            type: 'string',
            description: 'Notification message'
          },
          deploymentUrl: {
            type: 'string',
            description: 'Production URL of deployed app'
          }
        },
        required: ['channel', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'deploy_to_aws_ecs',
      description: 'Deploy application to AWS ECS Fargate with auto-scaling and load balancing',
      parameters: {
        type: 'object',
        properties: {
          appName: {
            type: 'string',
            description: 'Application name (lowercase, alphanumeric, hyphens only)'
          },
          githubRepoUrl: {
            type: 'string',
            description: 'GitHub repository URL'
          },
          cpu: {
            type: 'number',
            description: 'CPU units (256, 512, 1024, 2048, 4096)',
            enum: [256, 512, 1024, 2048, 4096],
            default: 256
          },
          memory: {
            type: 'number',
            description: 'Memory in MB (512, 1024, 2048, 4096, 8192)',
            enum: [512, 1024, 2048, 4096, 8192],
            default: 512
          },
          environmentVariables: {
            type: 'object',
            description: 'Environment variables as key-value pairs',
            additionalProperties: { type: 'string' }
          },
          minReplicas: {
            type: 'number',
            description: 'Minimum number of tasks',
            default: 1
          },
          maxReplicas: {
            type: 'number',
            description: 'Maximum number of tasks',
            default: 10
          }
        },
        required: ['appName', 'githubRepoUrl']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'deploy_to_gcp_cloud_run',
      description: 'Deploy application to GCP Cloud Run (serverless containers)',
      parameters: {
        type: 'object',
        properties: {
          appName: {
            type: 'string',
            description: 'Service name (lowercase, alphanumeric, hyphens only)'
          },
          githubRepoUrl: {
            type: 'string',
            description: 'GitHub repository URL'
          },
          region: {
            type: 'string',
            description: 'GCP region',
            enum: ['us-central1', 'us-east1', 'us-west1', 'europe-west1', 'asia-east1'],
            default: 'us-central1'
          },
          environmentVariables: {
            type: 'object',
            description: 'Environment variables',
            additionalProperties: { type: 'string' }
          },
          minInstances: {
            type: 'number',
            description: 'Minimum instances (0 for scale-to-zero)',
            default: 0
          },
          maxInstances: {
            type: 'number',
            description: 'Maximum instances',
            default: 100
          }
        },
        required: ['appName', 'githubRepoUrl']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'deploy_to_railway',
      description: 'Deploy application to Railway (simple deployment platform)',
      parameters: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Project name'
          },
          githubRepoUrl: {
            type: 'string',
            description: 'GitHub repository URL'
          },
          environmentVariables: {
            type: 'object',
            description: 'Environment variables',
            additionalProperties: { type: 'string' }
          }
        },
        required: ['projectName', 'githubRepoUrl']
      }
    }
  }
];

/**
 * Get tool by name
 */
export function getToolByName(name: string): ChatCompletionTool | undefined {
  return agentTools.find(tool => tool.function.name === name);
}

/**
 * Get all tool names
 */
export function getToolNames(): string[] {
  return agentTools.map(tool => tool.function.name);
}
