/**
 * Planner Agent
 * 
 * Analyzes natural language deployment requests and creates detailed deployment plans
 * Recommends optimal cloud providers, architectures, and cost estimates
 */

import { BaseAgent, AgentContext, AgentActionBuilder } from './baseAgent';
import { selectModelForTask } from './kernel.config';
import { storageV2 } from '../storage-v2';

export interface DeploymentIntent {
  naturalLanguageInput: string;
  repositoryUrl?: string;
  framework?: string;
  dependencies?: string[];
  environmentVariables?: Record<string, string>;
}

export interface DeploymentPlanResponse {
  provider: 'aws' | 'azure' | 'gcp' | 'vercel' | 'railway';
  region: string;
  architecture: {
    compute: string;
    database?: string;
    storage?: string;
    cdn?: string;
    monitoring: string;
  };
  scalingPolicy: {
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
  };
  costEstimate: {
    monthly: number; // in cents
    breakdown: {
      compute: number;
      database: number;
      storage: number;
      bandwidth: number;
    };
  };
  steps: Array<{
    order: number;
    description: string;
    service: string;
    estimatedTime: number; // in seconds
  }>;
  reasoning: string;
  securityChecks: string[];
  complianceChecks: string[];
  alternatives?: Array<{
    provider: string;
    costDifference: number;
    pros: string[];
    cons: string[];
  }>;
}

/**
 * Planner Agent
 * 
 * Uses AI to analyze deployment requests and create comprehensive plans
 */
export class PlannerAgent extends BaseAgent {
  constructor() {
    super('planner', selectModelForTask('planning'));
  }

  getName(): string {
    return 'Planner Agent';
  }

  /**
   * Create deployment plan from natural language input
   */
  async createDeploymentPlan(
    intent: DeploymentIntent,
    context: AgentContext
  ): Promise<DeploymentPlanResponse> {
    // Build action
    const action = new AgentActionBuilder()
      .type('create-deployment-plan')
      .description('Analyze deployment request and create architecture plan')
      .reasoning('User requested deployment analysis for optimal cloud architecture')
      .risk('low')
      .cost(50) // Estimated AI cost: $0.50
      .build();

    const result = await this.executeAction(action, context, async () => {
      return await this.generatePlan(intent, context);
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create deployment plan');
    }

    return result.data;
  }

  /**
   * Generate deployment plan using AI
   */
  private async generatePlan(
    intent: DeploymentIntent,
    context: AgentContext
  ): Promise<DeploymentPlanResponse> {
    const systemMessage = `You are an expert DevOps architect specializing in cloud deployments.

Your role:
1. Analyze deployment requests
2. Recommend optimal cloud providers and architectures
3. Estimate costs accurately
4. Consider scalability, reliability, and security
5. Explain your reasoning clearly

Output ONLY valid JSON matching the specified schema. No additional text.`;

    const prompt = `Analyze this deployment request and create a comprehensive plan:

**User Request**: "${intent.naturalLanguageInput}"

**Context**:
${intent.repositoryUrl ? `- Repository: ${intent.repositoryUrl}` : ''}
${intent.framework ? `- Framework: ${intent.framework}` : '- Framework: Auto-detect from repository'}
${intent.dependencies ? `- Dependencies: ${intent.dependencies.join(', ')}` : ''}
${context.costLimit ? `- Budget Limit: $${context.costLimit / 100}/month` : '- Budget: No specific limit'}

**Requirements**:
1. Choose the best cloud provider (AWS, Azure, GCP, Vercel, Railway)
2. Design the architecture (compute, database, storage, CDN, monitoring)
3. Estimate monthly costs with breakdown
4. Create step-by-step deployment plan
5. List security and compliance checks
6. Provide 2-3 alternative options

**Consider**:
- Cost efficiency (prefer serverless for low traffic)
- Framework-specific optimizations (e.g., Vercel for Next.js)
- Scalability (auto-scaling policies)
- Reliability (99.9%+ uptime target)
- Security best practices

**Output JSON Schema**:
{
  "provider": "aws|azure|gcp|vercel|railway",
  "region": "us-east-1",
  "architecture": {
    "compute": "AWS Lambda" | "ECS Fargate" | "Vercel Serverless",
    "database": "RDS PostgreSQL" | "DynamoDB" | null,
    "storage": "S3" | "Azure Blob" | "GCS",
    "cdn": "CloudFront" | "Azure CDN",
    "monitoring": "CloudWatch" | "Datadog"
  },
  "scalingPolicy": {
    "minInstances": 1,
    "maxInstances": 10,
    "targetCPU": 70
  },
  "costEstimate": {
    "monthly": 15000,
    "breakdown": {
      "compute": 8000,
      "database": 5000,
      "storage": 1000,
      "bandwidth": 1000
    }
  },
  "steps": [
    {
      "order": 1,
      "description": "Create VPC and subnets",
      "service": "vpc",
      "estimatedTime": 30
    }
  ],
  "reasoning": "I chose AWS Lambda because...",
  "securityChecks": [
    "Enable encryption at rest",
    "Configure WAF",
    "Set up VPC with private subnets"
  ],
  "complianceChecks": [
    "GDPR data residency in EU region",
    "SOC 2 compliant services"
  ],
  "alternatives": [
    {
      "provider": "vercel",
      "costDifference": -5000,
      "pros": ["Easier setup", "Free tier", "Built-in CDN"],
      "cons": ["Vendor lock-in", "Less control"]
    }
  ]
}`;

    // Invoke AI model
    const response = await this.invoke(prompt, systemMessage, 4000);

    // Parse response
    let plan: DeploymentPlanResponse;
    try {
      // In production, response.response would contain actual AI output
      // For now, create a realistic mock plan
      plan = this.createMockPlan(intent);

      // Log the plan generation
      await this.updateSessionHistory(context.sessionId, {
        role: 'assistant',
        content: JSON.stringify(plan, null, 2),
        timestamp: new Date()
      });

    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }

    // Save plan to database
    const savedPlan = await storageV2.createDeploymentPlan({
      userId: context.userId,
      projectId: context.projectId,
      agentSessionId: context.sessionId,
      naturalLanguageInput: intent.naturalLanguageInput,
      detectedFramework: intent.framework,
      detectedDependencies: intent.dependencies || [],
      provider: plan.provider,
      region: plan.region,
      architecture: plan.architecture,
      scalingPolicy: plan.scalingPolicy,
      costEstimate: plan.costEstimate,
      reasoning: plan.reasoning,
      steps: plan.steps,
      securityChecks: plan.securityChecks,
      complianceChecks: plan.complianceChecks,
      status: 'pending'
    });

    // Add plan ID to response
    (plan as any).planId = savedPlan.id;

    return plan;
  }

  /**
   * Mock plan generator (for development)
   * In production, this would be replaced by actual AI response
   */
  private createMockPlan(intent: DeploymentIntent): DeploymentPlanResponse {
    // Detect framework
    const framework = intent.framework?.toLowerCase() || 'unknown';
    
    // Choose provider based on framework
    let provider: DeploymentPlanResponse['provider'] = 'aws';
    let architecture: DeploymentPlanResponse['architecture'];
    let costEstimate: DeploymentPlanResponse['costEstimate'];

    if (framework.includes('next') || framework.includes('react')) {
      // Next.js/React - recommend Vercel
      provider = 'vercel';
      architecture = {
        compute: 'Vercel Serverless Functions',
        database: 'Vercel Postgres',
        storage: 'Vercel Blob Storage',
        cdn: 'Vercel Edge Network',
        monitoring: 'Vercel Analytics'
      };
      costEstimate = {
        monthly: 2000, // $20/month
        breakdown: {
          compute: 0, // Free tier
          database: 1500,
          storage: 300,
          bandwidth: 200
        }
      };
    } else if (framework.includes('node') || framework.includes('express')) {
      // Node.js - recommend AWS
      provider = 'aws';
      architecture = {
        compute: 'AWS ECS Fargate',
        database: 'RDS PostgreSQL',
        storage: 'S3',
        cdn: 'CloudFront',
        monitoring: 'CloudWatch'
      };
      costEstimate = {
        monthly: 15000, // $150/month
        breakdown: {
          compute: 8000,
          database: 5000,
          storage: 1000,
          bandwidth: 1000
        }
      };
    } else {
      // Default - AWS
      provider = 'aws';
      architecture = {
        compute: 'AWS Lambda',
        storage: 'S3',
        cdn: 'CloudFront',
        monitoring: 'CloudWatch'
      };
      costEstimate = {
        monthly: 5000, // $50/month
        breakdown: {
          compute: 3000,
          database: 0,
          storage: 1000,
          bandwidth: 1000
        }
      };
    }

    return {
      provider,
      region: provider === 'vercel' ? 'global' : 'us-east-1',
      architecture,
      scalingPolicy: {
        minInstances: 1,
        maxInstances: provider === 'vercel' ? 100 : 10,
        targetCPU: 70
      },
      costEstimate,
      steps: [
        {
          order: 1,
          description: 'Initialize project infrastructure',
          service: 'setup',
          estimatedTime: 30
        },
        {
          order: 2,
          description: `Deploy to ${provider}`,
          service: 'deployment',
          estimatedTime: 120
        },
        {
          order: 3,
          description: 'Configure monitoring and alerts',
          service: 'monitoring',
          estimatedTime: 60
        }
      ],
      reasoning: `I recommend ${provider} for this ${framework} application because it offers excellent ${provider === 'vercel' ? 'developer experience and automatic scaling' : 'flexibility and control'}. The estimated cost of $${costEstimate.monthly / 100}/month fits within typical budgets for this type of application.`,
      securityChecks: [
        'Enable HTTPS/TLS encryption',
        'Configure CORS policies',
        'Set up environment variable encryption',
        'Enable DDoS protection'
      ],
      complianceChecks: [
        'GDPR compliant data storage',
        'SOC 2 certified infrastructure'
      ],
      alternatives: [
        {
          provider: provider === 'vercel' ? 'aws' : 'vercel',
          costDifference: provider === 'vercel' ? 13000 : -13000,
          pros: provider === 'vercel' ? ['More control', 'Lower long-term costs'] : ['Easier setup', 'Better DX', 'Free tier'],
          cons: provider === 'vercel' ? ['More complexity', 'Slower setup'] : ['Vendor lock-in', 'Higher costs at scale']
        }
      ]
    };
  }

  /**
   * Analyze existing deployment and suggest optimizations
   */
  async analyzeExistingDeployment(
    deploymentId: string,
    context: AgentContext
  ): Promise<{
    currentCost: number;
    optimizedCost: number;
    savings: number;
    recommendations: string[];
  }> {
    const action = new AgentActionBuilder()
      .type('analyze-deployment')
      .description('Analyze existing deployment for cost optimization')
      .reasoning('User requested analysis of current deployment')
      .risk('low')
      .cost(30)
      .build();

    const result = await this.executeAction(action, context, async () => {
      // Mock analysis
      return {
        currentCost: 15000, // $150/month
        optimizedCost: 9500, // $95/month
        savings: 5500, // $55/month saved
        recommendations: [
          'Switch from t3.large to t3.medium instances (same performance, 40% cost reduction)',
          'Enable S3 Intelligent-Tiering (automatic cost optimization)',
          'Use Aurora Serverless instead of RDS (pay per request)',
          'Implement CloudFront caching (reduce origin requests by 60%)'
        ]
      };
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to analyze deployment');
    }

    return result.data;
  }
}

