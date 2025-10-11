# Semantic Kernel Setup Guide

**Purpose**: Initialize Microsoft Semantic Kernel for multi-agent orchestration  
**Date**: October 11, 2025  
**Prerequisites**: Azure AI Foundry endpoints configured

---

## Overview

Semantic Kernel is Microsoft's SDK for AI orchestration. Careerate V2.0 uses it to coordinate multiple AI agents:
- **Planner Agent**: Analyzes deployment intent
- **Deployer Agent**: Executes cloud operations
- **Monitor Agent**: Watches deployments
- **Healer Agent**: Auto-remediates issues
- **Cost Optimizer Agent**: Reduces cloud spend

---

## Step 1: Install Dependencies

```bash
# Install Semantic Kernel
npm install @microsoft/semantic-kernel

# Install Azure SDK for AI
npm install @azure/ai-inference

# Install MCP server packages
npm install @modelcontextprotocol/sdk
npm install @modelcontextprotocol/server-filesystem
npm install @modelcontextprotocol/server-github
npm install @modelcontextprotocol/server-postgres

# Install additional dependencies
npm install zod  # For schema validation
npm install winston  # For logging
```

---

## Step 2: Create Kernel Configuration

Create `server/agents/kernel.config.ts`:

```typescript
import { Kernel, ChatCompletionService } from '@microsoft/semantic-kernel';
import { AzureOpenAIChatCompletion } from '@microsoft/semantic-kernel/connectors/azure-openai';
import { keyVaultService } from '../services/azureKeyVaultService';
import winston from 'winston';

// Logger for agent actions
export const agentLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/agent-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/agent-combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

/**
 * Initialize Semantic Kernel with Azure AI Foundry models
 */
export async function initializeKernel(): Promise<Kernel> {
  agentLogger.info('Initializing Semantic Kernel...');

  // Load credentials from Key Vault
  const claudeEndpoint = await keyVaultService.getSecret('AZURE-CLAUDE-ENDPOINT');
  const claudeApiKey = await keyVaultService.getSecret('AZURE-CLAUDE-API-KEY');
  
  const gpt5Endpoint = await keyVaultService.getSecret('AZURE-GPT5-ENDPOINT');
  const gpt5ApiKey = await keyVaultService.getSecret('AZURE-GPT5-API-KEY');
  const gpt5Deployment = await keyVaultService.getSecret('AZURE-GPT5-DEPLOYMENT-NAME');
  
  const phi4Endpoint = await keyVaultService.getSecret('AZURE-PHI4-ENDPOINT');
  const phi4ApiKey = await keyVaultService.getSecret('AZURE-PHI4-API-KEY');

  // Create kernel
  const kernel = new Kernel();

  // Register Claude 3.5 Sonnet (primary reasoning)
  kernel.addChatCompletionService(
    'claude-35-sonnet',
    new AzureOpenAIChatCompletion({
      endpoint: claudeEndpoint!,
      apiKey: claudeApiKey!,
      modelId: 'claude-3-5-sonnet-20241022',
      serviceId: 'claude-35-sonnet'
    })
  );

  // Register GPT-5 (code generation, NLU)
  kernel.addChatCompletionService(
    'gpt-5',
    new AzureOpenAIChatCompletion({
      endpoint: gpt5Endpoint!,
      apiKey: gpt5ApiKey!,
      deploymentName: gpt5Deployment!,
      serviceId: 'gpt-5'
    })
  );

  // Register Phi-4 (cost optimization)
  kernel.addChatCompletionService(
    'phi-4',
    new AzureOpenAIChatCompletion({
      endpoint: phi4Endpoint!,
      apiKey: phi4ApiKey!,
      modelId: 'phi-4-reasoning-14b',
      serviceId: 'phi-4'
    })
  );

  agentLogger.info('Semantic Kernel initialized with 3 AI services');

  return kernel;
}

/**
 * Get appropriate model for task type
 */
export function selectModelForTask(taskType: string): string {
  switch (taskType) {
    case 'planning':
    case 'reasoning':
    case 'architecture':
      return 'claude-35-sonnet'; // Complex reasoning
    
    case 'code-generation':
    case 'natural-language':
      return 'gpt-5'; // Code and NLU
    
    case 'cost-optimization':
    case 'simple-tasks':
      return 'phi-4'; // Efficient for simpler tasks
    
    default:
      return 'claude-35-sonnet'; // Default to most capable
  }
}
```

---

## Step 3: Create Base Agent Class

Create `server/agents/baseAgent.ts`:

```typescript
import { Kernel } from '@microsoft/semantic-kernel';
import { agentLogger } from './kernel.config';
import { storage } from '../storage';

export interface AgentContext {
  userId: string;
  sessionId: string;
  deploymentId?: string;
  autonomyLevel: 'supervised' | 'semi-autonomous' | 'fully-autonomous';
  costLimit?: number; // in cents
}

export interface AgentAction {
  type: string;
  description: string;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  costImpact: number; // estimated cost in cents
  requiresApproval: boolean;
}

export abstract class BaseAgent {
  protected kernel: Kernel;
  protected agentType: string;
  protected modelId: string;

  constructor(kernel: Kernel, agentType: string, modelId: string) {
    this.kernel = kernel;
    this.agentType = agentType;
    this.modelId = modelId;
  }

  /**
   * Execute agent action with autonomy checks
   */
  protected async executeAction(
    action: AgentAction,
    context: AgentContext,
    executor: () => Promise<any>
  ): Promise<any> {
    agentLogger.info(`[${this.agentType}] Executing action: ${action.type}`, {
      userId: context.userId,
      sessionId: context.sessionId,
      action: action.type,
      riskLevel: action.riskLevel
    });

    // Log action to database
    const actionRecord = await storage.createAgentAction({
      userId: context.userId,
      agentSessionId: context.sessionId,
      actionType: action.type,
      agentType: this.agentType,
      modelUsed: this.modelId,
      actionDetails: action,
      reasoning: action.reasoning,
      riskLevel: action.riskLevel,
      requiresApproval: action.requiresApproval,
      costImpact: action.costImpact,
      status: 'pending'
    });

    try {
      // Check if approval is needed
      if (this.needsApproval(action, context)) {
        agentLogger.info(`[${this.agentType}] Action requires user approval`);
        
        await storage.updateAgentAction(actionRecord.id, {
          status: 'pending',
          requiresApproval: true
        });

        // Emit event for frontend to show approval modal
        // This will be handled by WebSocket/SSE in production
        throw new Error('USER_APPROVAL_REQUIRED');
      }

      // Execute the action
      const startTime = Date.now();
      const result = await executor();
      const executionTime = Date.now() - startTime;

      // Log success
      await storage.updateAgentAction(actionRecord.id, {
        status: 'completed',
        result,
        executionTimeMs: executionTime,
        completedAt: new Date()
      });

      agentLogger.info(`[${this.agentType}] Action completed successfully`, {
        actionId: actionRecord.id,
        executionTime
      });

      return result;
    } catch (error) {
      // Log failure
      await storage.updateAgentAction(actionRecord.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      agentLogger.error(`[${this.agentType}] Action failed`, {
        actionId: actionRecord.id,
        error: error instanceof Error ? error.message : error
      });

      throw error;
    }
  }

  /**
   * Determine if action needs user approval
   */
  private needsApproval(action: AgentAction, context: AgentContext): boolean {
    // Always require approval for high-risk actions
    if (action.riskLevel === 'high') {
      return true;
    }

    // Check autonomy level
    if (context.autonomyLevel === 'supervised') {
      return true; // Supervised mode: always ask
    }

    if (context.autonomyLevel === 'semi-autonomous') {
      // Semi-autonomous: ask for medium+ risk or high cost
      return action.riskLevel === 'medium' || action.costImpact > 5000; // >$50/month
    }

    // Fully autonomous: only ask for explicitly flagged actions
    return action.requiresApproval;
  }

  /**
   * Invoke AI model with prompt
   */
  protected async invoke(prompt: string, systemMessage?: string): Promise<string> {
    const service = this.kernel.getService<ChatCompletionService>(this.modelId);
    
    const messages = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await service.getChatCompletions(messages, {
      maxTokens: 4000,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }
}
```

---

## Step 4: Implement Planner Agent

Create `server/agents/plannerAgent.ts`:

```typescript
import { Kernel } from '@microsoft/semantic-kernel';
import { BaseAgent, AgentContext } from './baseAgent';
import { storage } from '../storage';
import { selectModelForTask } from './kernel.config';

export interface DeploymentPlan {
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
}

export class PlannerAgent extends BaseAgent {
  constructor(kernel: Kernel) {
    super(kernel, 'planner', selectModelForTask('planning'));
  }

  /**
   * Analyze natural language deployment request and create plan
   */
  async createDeploymentPlan(
    naturalLanguageInput: string,
    context: AgentContext & {
      repositoryUrl?: string;
      framework?: string;
      dependencies?: string[];
    }
  ): Promise<DeploymentPlan> {
    const systemMessage = `
You are an expert DevOps architect. Analyze deployment requests and recommend optimal cloud architectures.

Consider:
- Cost efficiency
- Scalability
- Reliability (99.9%+ uptime)
- Security best practices
- Framework-specific optimizations

Output valid JSON only.
    `.trim();

    const prompt = `
Analyze this deployment request:
"${naturalLanguageInput}"

Context:
- Repository: ${context.repositoryUrl || 'Unknown'}
- Framework: ${context.framework || 'Auto-detect'}
- Dependencies: ${context.dependencies?.join(', ') || 'Unknown'}
- User budget: ${context.costLimit ? `$${context.costLimit / 100}/month` : 'No limit'}

Recommend:
1. Best cloud provider (AWS, Azure, GCP, Vercel, Railway)
2. Specific services (compute, database, storage, CDN)
3. Architecture diagram (as text)
4. Estimated monthly cost breakdown
5. Deployment steps (ordered)
6. Scaling policy
7. Security considerations

Explain your reasoning for each choice.

Output as JSON matching this schema:
{
  "provider": "aws" | "azure" | "gcp" | "vercel" | "railway",
  "region": "us-east-1",
  "architecture": {
    "compute": "ECS Fargate",
    "database": "RDS PostgreSQL",
    "storage": "S3",
    "cdn": "CloudFront",
    "monitoring": "CloudWatch"
  },
  "scalingPolicy": { "minInstances": 1, "maxInstances": 10, "targetCPU": 70 },
  "costEstimate": {
    "monthly": 15000,
    "breakdown": { "compute": 8000, "database": 5000, "storage": 1000, "bandwidth": 1000 }
  },
  "steps": [
    { "order": 1, "description": "Create VPC", "service": "vpc", "estimatedTime": 30 },
    ...
  ],
  "reasoning": "I chose AWS ECS because...",
  "securityChecks": ["Enable encryption at rest", "Configure WAF", ...],
  "complianceChecks": ["GDPR data residency", ...]
}
    `.trim();

    const response = await this.invoke(prompt, systemMessage);

    // Parse JSON response
    const plan: DeploymentPlan = JSON.parse(response);

    // Save plan to database
    await storage.createDeploymentPlan({
      userId: context.userId,
      agentSessionId: context.sessionId,
      naturalLanguageInput,
      detectedFramework: context.framework,
      detectedDependencies: context.dependencies || [],
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

    return plan;
  }
}
```

---

## Step 5: Create Agent Orchestrator

Create `server/agents/orchestrator.ts`:

```typescript
import { Kernel } from '@microsoft/semantic-kernel';
import { initializeKernel } from './kernel.config';
import { PlannerAgent } from './plannerAgent';
// Import other agents as they're implemented

export class AgentOrchestrator {
  private kernel: Kernel | null = null;
  private plannerAgent: PlannerAgent | null = null;
  // Add other agents here

  async initialize() {
    if (!this.kernel) {
      this.kernel = await initializeKernel();
      this.plannerAgent = new PlannerAgent(this.kernel);
      // Initialize other agents
    }
  }

  getPlannerAgent(): PlannerAgent {
    if (!this.plannerAgent) {
      throw new Error('Orchestrator not initialized. Call initialize() first.');
    }
    return this.plannerAgent;
  }

  // Add methods for other agents
}

// Export singleton
export const orchestrator = new AgentOrchestrator();
```

---

## Step 6: Test Semantic Kernel Integration

Create `scripts/test-semantic-kernel.ts`:

```typescript
import { orchestrator } from '../server/agents/orchestrator';

async function testPlannerAgent() {
  console.log('🧪 Testing Semantic Kernel + Planner Agent...\n');

  // Initialize orchestrator
  await orchestrator.initialize();
  console.log('✅ Orchestrator initialized\n');

  // Test planner
  const planner = orchestrator.getPlannerAgent();
  
  const plan = await planner.createDeploymentPlan(
    'Deploy my Next.js blog to AWS with PostgreSQL database',
    {
      userId: 'test-user',
      sessionId: 'test-session',
      autonomyLevel: 'supervised',
      repositoryUrl: 'https://github.com/example/nextjs-blog',
      framework: 'nextjs',
      dependencies: ['next', 'react', 'postgres']
    }
  );

  console.log('📋 Deployment Plan Generated:\n');
  console.log(`Provider: ${plan.provider}`);
  console.log(`Region: ${plan.region}`);
  console.log(`Estimated Cost: $${plan.costEstimate.monthly / 100}/month`);
  console.log(`\nArchitecture:`);
  console.log(JSON.stringify(plan.architecture, null, 2));
  console.log(`\nReasoning: ${plan.reasoning.substring(0, 200)}...`);
  console.log(`\n✅ Planner Agent working correctly!`);
}

testPlannerAgent().catch(console.error);
```

Run test:

```bash
tsx scripts/test-semantic-kernel.ts
```

---

## Next Steps

1. ✅ Semantic Kernel initialized
2. ✅ Base agent class created
3. ✅ Planner agent implemented
4. 🔜 Implement Deployer agent
5. 🔜 Implement Monitor agent
6. 🔜 Implement Healer agent
7. 🔜 Implement Cost Optimizer agent

---

**Document Version**: 1.0  
**Last Updated**: October 11, 2025  
**Next**: Implement remaining agents (Phase 5)

