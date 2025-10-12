# 🚀 Microsoft Agent Framework Migration - October 2025

## CRITICAL UPDATE: Semantic Kernel → Microsoft Agent Framework

**Date**: October 12, 2025  
**Status**: ⚠️ **REQUIRED MIGRATION**  
**Priority**: **HIGH** (Semantic Kernel in maintenance mode)

---

## 📋 Executive Summary

Microsoft launched **Microsoft Agent Framework** on October 1, 2025 as the unified successor to:
- ❌ **Semantic Kernel** (now maintenance mode)
- ❌ **AutoGen** (now maintenance mode)

**What This Means for Careerate:**
- ✅ **Better Features**: MCP servers, A2A protocol, graph workflows
- ✅ **Future-Proof**: All new development focuses on Agent Framework
- ✅ **Enterprise Ready**: Built-in observability, security, compliance
- ✅ **Easier Development**: Unified API, better abstractions

---

## 🔄 Migration Overview

### Current State (Semantic Kernel)
```typescript
// server/agents/kernel.config.ts
import { KernelConfig } from './kernel.config';

export class KernelConfig {
  private models: Map<string, AIModelConfig> = new Map();
  async initialize(): Promise<void> {
    // Manual model management
  }
}
```

### New State (Microsoft Agent Framework)
```typescript
// server/agents/framework.config.ts
import { AgentFramework, Agent, Workflow, MCPClient } from '@microsoft/agent-framework';

export class CareerateFramework {
  private framework: AgentFramework;
  private mcpClients: Map<string, MCPClient> = new Map();
  
  async initialize(): Promise<void> {
    this.framework = new AgentFramework({
      modelProvider: 'azure-openai', // or 'azure-ai'
      telemetry: { provider: 'opentelemetry' },
      security: { azureIntegration: true }
    });
    
    // Native MCP server integration
    await this.registerMCPServers();
  }
}
```

---

## 🎯 Key Differences

### 1. Model Context Protocol (MCP) - First-Class Support

**Before (Semantic Kernel)**:
```typescript
// Manual plugin creation, no standard protocol
class CustomPlugin {
  @KernelFunction
  async deployToAWS(input: string): Promise<string> {
    // Custom implementation
  }
}
```

**After (Agent Framework)**:
```typescript
// Native MCP server integration
const mcpClient = framework.createMCPClient({
  server: '@modelcontextprotocol/server-aws',
  config: {
    credentials: await getAWSCredentials()
  }
});

// MCP servers handle the protocol automatically
await agent.useMCPServer(mcpClient);
```

### 2. Agent-to-Agent (A2A) Protocol

**New Feature**: Agents can communicate directly!

```typescript
// Create agents
const plannerAgent = framework.createAgent({
  name: 'planner',
  model: 'claude-35-sonnet',
  role: 'deployment-planning'
});

const deployerAgent = framework.createAgent({
  name: 'deployer',
  model: 'gpt-5',
  role: 'deployment-execution'
});

// A2A communication - agents can call each other!
const workflow = framework.createWorkflow({
  start: plannerAgent,
  edges: [
    { from: 'planner', to: 'deployer', condition: 'plan-approved' },
    { from: 'deployer', to: 'monitor', condition: 'deployment-complete' }
  ]
});
```

### 3. Graph-Based Workflows

**Before**: Linear orchestration
```typescript
// Manual orchestration
const plan = await plannerAgent.execute(input);
if (plan.approved) {
  const result = await deployerAgent.execute(plan);
  await monitorAgent.execute(result);
}
```

**After**: Visual, declarative workflows
```typescript
const workflow = framework.createWorkflow({
  name: 'deployment-flow',
  nodes: [
    { id: 'plan', agent: plannerAgent },
    { id: 'review', type: 'human-approval' }, // Human-in-the-loop!
    { id: 'deploy', agent: deployerAgent },
    { id: 'monitor', agent: monitorAgent },
    { id: 'heal', agent: healerAgent, trigger: 'on-error' }
  ],
  edges: [
    { from: 'plan', to: 'review', condition: 'autonomy-level < 3' },
    { from: 'review', to: 'deploy', condition: 'approved' },
    { from: 'deploy', to: 'monitor' },
    { from: 'monitor', to: 'heal', condition: 'health-check-failed' }
  ],
  checkpoints: true, // Save state at each step!
  retryPolicy: { maxAttempts: 3, backoff: 'exponential' }
});
```

### 4. State Management & Threads

**After**: Built-in thread management
```typescript
// Create a thread (conversation context)
const thread = framework.createThread({
  userId: user.id,
  deploymentId: deployment.id,
  context: {
    cloudProvider: 'aws',
    region: 'us-east-1'
  }
});

// Agents share context automatically
await plannerAgent.execute({ input: userQuery }, thread);
await deployerAgent.execute({ plan: planResult }, thread); // Has full context!
```

### 5. Native Observability

**After**: OpenTelemetry built-in
```typescript
const framework = new AgentFramework({
  telemetry: {
    provider: 'opentelemetry',
    exporters: [
      { type: 'azure-monitor', connectionString: process.env.APPINSIGHTS_CONNECTION_STRING },
      { type: 'datadog', apiKey: process.env.DATADOG_API_KEY }
    ],
    traces: true,
    metrics: true,
    logs: true
  }
});

// Every agent action is automatically traced!
// No manual logging needed!
```

---

## 🔧 Migration Steps

### Phase 1: Update Dependencies (Immediate)

#### Remove Old:
```bash
npm uninstall semantic-kernel
```

#### Install New:
```bash
npm install @microsoft/agent-framework
```

**Package Details**:
- **Python**: `pip install agent-framework`
- **.NET**: `dotnet add package Microsoft.Agents.AI`
- **Node.js/TypeScript**: `npm install @microsoft/agent-framework`

### Phase 2: Refactor Core Config (1-2 hours)

**Files to Update**:
1. `server/agents/kernel.config.ts` → `server/agents/framework.config.ts`
2. `server/agents/baseAgent.ts` → Use `Agent` class from framework
3. `server/agents/orchestrator.ts` → Use `Workflow` class

**New Structure**:
```typescript
// server/agents/framework.config.ts
import { AgentFramework, ModelProvider, TelemetryConfig } from '@microsoft/agent-framework';
import { keyVaultService } from '../services/azureKeyVaultService';

export class CareerateAgentFramework {
  private framework: AgentFramework;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load AI model credentials from Key Vault
    const claudeEndpoint = await keyVaultService.getSecret('AZURE-CLAUDE-ENDPOINT');
    const claudeApiKey = await keyVaultService.getSecret('AZURE-CLAUDE-API-KEY');
    const gpt5Endpoint = await keyVaultService.getSecret('AZURE-GPT5-ENDPOINT');
    const gpt5ApiKey = await keyVaultService.getSecret('AZURE-GPT5-API-KEY');

    // Initialize Microsoft Agent Framework
    this.framework = new AgentFramework({
      // Model configuration
      models: [
        {
          id: 'claude-35-sonnet',
          provider: 'azure-ai',
          endpoint: claudeEndpoint,
          apiKey: claudeApiKey,
          modelId: 'claude-3-5-sonnet-20241022'
        },
        {
          id: 'gpt-5',
          provider: 'azure-openai',
          endpoint: gpt5Endpoint,
          apiKey: gpt5ApiKey,
          deployment: 'gpt-5-deployment'
        }
      ],

      // Telemetry & Observability (Built-in!)
      telemetry: {
        provider: 'opentelemetry',
        exporters: [
          {
            type: 'azure-monitor',
            connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
          }
        ],
        traces: true,
        metrics: true,
        logs: true
      },

      // Security
      security: {
        azureIntegration: true,
        keyVault: {
          vaultUrl: process.env.AZURE_KEY_VAULT_URL
        }
      },

      // Agent-to-Agent Protocol
      a2a: {
        enabled: true,
        discovery: 'auto' // Agents can find each other!
      }
    });

    // Register MCP servers
    await this.registerMCPServers();

    this.initialized = true;
  }

  async registerMCPServers(): Promise<void> {
    // AWS MCP Server
    await this.framework.registerMCPServer({
      name: 'aws-deployment',
      server: '@modelcontextprotocol/server-aws',
      config: {
        region: 'us-east-1',
        credentialsProvider: 'azure-keyvault' // Use our Key Vault!
      }
    });

    // Azure MCP Server
    await this.framework.registerMCPServer({
      name: 'azure-deployment',
      server: '@modelcontextprotocol/server-azure',
      config: {
        subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
        credentialsProvider: 'azure-keyvault'
      }
    });

    // GCP MCP Server
    await this.framework.registerMCPServer({
      name: 'gcp-deployment',
      server: '@modelcontextprotocol/server-gcp',
      config: {
        projectId: process.env.GCP_PROJECT_ID,
        credentialsProvider: 'azure-keyvault'
      }
    });

    // GitHub MCP Server
    await this.framework.registerMCPServer({
      name: 'github',
      server: '@modelcontextprotocol/server-github',
      config: {
        auth: {
          type: 'oauth',
          provider: 'careerate-oauth'
        }
      }
    });
  }

  getFramework(): AgentFramework {
    if (!this.initialized) {
      throw new Error('Framework not initialized. Call initialize() first.');
    }
    return this.framework;
  }
}

export const careerateFramework = new CareerateAgentFramework();
```

### Phase 3: Refactor Agents (2-3 hours)

**Before**:
```typescript
// server/agents/plannerAgent.ts (Old)
export class PlannerAgent {
  private agentLogger: winston.Logger;
  
  async plan(input: string): Promise<Plan> {
    // Manual implementation
  }
}
```

**After**:
```typescript
// server/agents/plannerAgent.ts (New)
import { Agent, AgentConfig } from '@microsoft/agent-framework';
import { careerateFramework } from './framework.config';

export class PlannerAgent {
  private agent: Agent;

  async initialize(): Promise<void> {
    const framework = careerateFramework.getFramework();

    this.agent = framework.createAgent({
      name: 'deployment-planner',
      model: 'claude-35-sonnet', // Best for reasoning
      role: 'planning',
      
      // System prompt
      instructions: `You are Careerate's Deployment Planner. Your job is to:
1. Analyze the user's application (tech stack, dependencies, scale requirements)
2. Recommend the optimal cloud provider (AWS, Azure, GCP) and services
3. Estimate costs and performance
4. Generate a detailed deployment plan
5. Identify potential issues and risks

Be concise, accurate, and always explain your reasoning.`,

      // MCP servers this agent can use
      mcpServers: ['aws-deployment', 'azure-deployment', 'gcp-deployment', 'github'],

      // Agent capabilities
      capabilities: {
        reasoning: true, // Use chain-of-thought
        tools: true, // Can call MCP server tools
        memory: true, // Remember conversation context
        multimodal: false // Text only for now
      },

      // Observability (automatic!)
      telemetry: {
        trackInputs: true,
        trackOutputs: true,
        trackTools: true,
        trackLatency: true
      }
    });
  }

  async plan(input: string, thread?: AgentThread): Promise<DeploymentPlan> {
    // Execute agent with automatic tracing, logging, error handling!
    const response = await this.agent.execute({
      input,
      thread,
      options: {
        temperature: 0.3, // Consistent planning
        maxTokens: 4000
      }
    });

    // Response is automatically structured and validated
    return response.as<DeploymentPlan>();
  }
}
```

### Phase 4: Create Workflows (2-3 hours)

**New Capability**: Visual, graph-based multi-agent workflows

```typescript
// server/workflows/deploymentWorkflow.ts
import { Workflow, WorkflowConfig } from '@microsoft/agent-framework';
import { careerateFramework } from '../agents/framework.config';

export class DeploymentWorkflow {
  private workflow: Workflow;

  async initialize(): Promise<void> {
    const framework = careerateFramework.getFramework();

    this.workflow = framework.createWorkflow({
      name: 'careerate-deployment-flow',
      description: 'End-to-end deployment with planning, execution, monitoring, and healing',

      // Define the workflow graph
      nodes: [
        {
          id: 'analyze',
          type: 'agent',
          agent: 'deployment-planner',
          config: {
            model: 'claude-35-sonnet',
            autonomyLevel: 'supervised' // Requires human approval
          }
        },
        {
          id: 'cost-check',
          type: 'condition',
          condition: 'estimatedCost < userBudget',
          onTrue: 'approve',
          onFalse: 'notify-user'
        },
        {
          id: 'approve',
          type: 'human-in-the-loop',
          prompt: 'Review deployment plan and approve',
          timeout: 300000, // 5 minutes
          onTimeout: 'cancel'
        },
        {
          id: 'deploy',
          type: 'agent',
          agent: 'deployment-executor',
          config: {
            model: 'gpt-5',
            mcpServers: ['aws-deployment', 'azure-deployment', 'gcp-deployment'],
            retryPolicy: {
              maxAttempts: 3,
              backoff: 'exponential'
            }
          }
        },
        {
          id: 'monitor',
          type: 'agent',
          agent: 'health-monitor',
          config: {
            model: 'phi-4', // Efficient for monitoring
            interval: 30000, // Check every 30 seconds
            duration: 600000 // Monitor for 10 minutes
          }
        },
        {
          id: 'heal',
          type: 'agent',
          agent: 'auto-healer',
          config: {
            model: 'claude-35-sonnet',
            trigger: 'on-health-check-failed'
          }
        }
      ],

      // Define edges (flow between nodes)
      edges: [
        { from: 'analyze', to: 'cost-check' },
        { from: 'approve', to: 'deploy', condition: 'approved === true' },
        { from: 'deploy', to: 'monitor', condition: 'deployment.status === "success"' },
        { from: 'monitor', to: 'heal', condition: 'healthCheck.status === "unhealthy"' },
        { from: 'heal', to: 'monitor', condition: 'healing.status === "success"' }
      ],

      // Enable checkpointing for long-running workflows
      checkpointing: {
        enabled: true,
        storage: 'azure-storage',
        interval: 'per-node' // Save after each node completes
      },

      // Error handling
      errorHandling: {
        onError: 'retry-then-notify',
        maxRetries: 3,
        notifyUser: true
      }
    });
  }

  async execute(input: DeploymentRequest, userId: string): Promise<WorkflowResult> {
    // Create a thread for this workflow execution
    const thread = await careerateFramework.getFramework().createThread({
      userId,
      workflowId: this.workflow.id,
      context: {
        request: input,
        timestamp: new Date().toISOString()
      }
    });

    // Execute workflow with automatic:
    // - Tracing (OpenTelemetry)
    // - Logging
    // - Error handling
    // - State management
    // - Checkpointing
    const result = await this.workflow.execute({
      input,
      thread,
      options: {
        timeout: 3600000, // 1 hour max
        observability: true
      }
    });

    return result;
  }
}
```

---

## 📦 New MCP Servers to Integrate

Microsoft Agent Framework has **first-class MCP support**. Here are the MCP servers we should integrate:

### Official MCP Servers:
```bash
# Install MCP servers
npm install @modelcontextprotocol/server-aws
npm install @modelcontextprotocol/server-azure
npm install @modelcontextprotocol/server-gcp
npm install @modelcontextprotocol/server-github
npm install @modelcontextprotocol/server-postgres
npm install @modelcontextprotocol/server-kubernetes
```

### MCP Server Configuration:
```typescript
// Each MCP server provides standard tools that agents can use

// AWS MCP Server Tools:
// - ec2.launchInstance()
// - ecs.createService()
// - lambda.createFunction()
// - rds.createDatabase()
// - s3.createBucket()
// - cloudformation.createStack()

// Azure MCP Server Tools:
// - containerApps.create()
// - appService.create()
// - cosmosDb.createDatabase()
// - storage.createAccount()
// - armTemplates.deploy()

// GCP MCP Server Tools:
// - compute.createInstance()
// - cloudRun.deploy()
// - cloudSql.createInstance()
// - storage.createBucket()
// - deploymentManager.create()

// GitHub MCP Server Tools:
// - repo.analyze()
// - repo.getInfo()
// - actions.trigger()
// - releases.create()
```

---

## 🎯 Benefits of Migration

### 1. Developer Experience
- ✅ **Simpler API**: Unified framework, no switching between SK/AutoGen
- ✅ **Better TypeScript support**: Full type safety
- ✅ **Less boilerplate**: Framework handles common patterns

### 2. Features
- ✅ **MCP Native**: No custom plugin development needed
- ✅ **A2A Protocol**: Agents can communicate directly
- ✅ **Graph Workflows**: Visual, declarative multi-agent orchestration
- ✅ **Checkpointing**: Resume long-running workflows
- ✅ **Human-in-the-Loop**: Built-in approval flows

### 3. Observability
- ✅ **OpenTelemetry**: Industry-standard tracing/metrics
- ✅ **Automatic Logging**: Every agent action logged
- ✅ **Azure Monitor Integration**: Native integration
- ✅ **Distributed Tracing**: Track requests across agents

### 4. Enterprise
- ✅ **Security**: Azure integration, Key Vault support
- ✅ **Compliance**: 50+ standards supported
- ✅ **Scalability**: Cloud-agnostic deployment
- ✅ **Governance**: Policy enforcement, audit logs

---

## ⚠️ Breaking Changes

### 1. Import Paths
```typescript
// Before
import { Kernel, KernelFunction } from 'semantic-kernel';

// After
import { AgentFramework, Agent, Workflow } from '@microsoft/agent-framework';
```

### 2. Agent Creation
```typescript
// Before
const kernel = new Kernel();
const agent = kernel.createAgent({ model: 'gpt-4' });

// After
const framework = new AgentFramework();
const agent = framework.createAgent({ name: 'agent-1', model: 'gpt-5' });
```

### 3. Tool/Plugin System
```typescript
// Before (Semantic Kernel Plugins)
class CustomPlugin {
  @KernelFunction
  async myTool(input: string): Promise<string> {
    // Custom implementation
  }
}

// After (MCP Servers)
// Use standard MCP servers - no custom plugin code needed!
await framework.registerMCPServer({
  name: 'my-tools',
  server: '@modelcontextprotocol/server-custom',
  config: { /* server config */ }
});
```

---

## 📅 Migration Timeline

### Week 1 (Oct 14-18) - Foundation
- [ ] Install Microsoft Agent Framework
- [ ] Create `framework.config.ts`
- [ ] Migrate model configuration
- [ ] Register MCP servers
- [ ] Update environment variables

### Week 2 (Oct 21-25) - Agents
- [ ] Refactor `PlannerAgent`
- [ ] Refactor `DeployerAgent`
- [ ] Refactor `MonitorAgent`
- [ ] Refactor `HealerAgent`
- [ ] Refactor `CostOptimizerAgent`

### Week 3 (Oct 28-Nov 1) - Workflows
- [ ] Create `DeploymentWorkflow`
- [ ] Implement checkpointing
- [ ] Add human-in-the-loop approvals
- [ ] Test multi-agent orchestration

### Week 4 (Nov 4-8) - Testing & Cleanup
- [ ] E2E workflow testing
- [ ] Verify observability (OpenTelemetry)
- [ ] Remove old Semantic Kernel code
- [ ] Update documentation

---

## 🔗 Resources

- **Official Docs**: https://learn.microsoft.com/en-us/agent-framework/
- **GitHub**: https://github.com/microsoft/agent-framework
- **Migration Guide**: https://learn.microsoft.com/en-us/agent-framework/migration/semantic-kernel
- **MCP Protocol**: https://modelcontextprotocol.io/
- **A2A Protocol**: https://a2a-protocol.ai/

---

## 📝 Next Steps (Immediate)

1. **Install Agent Framework** (5 min)
   ```bash
   npm install @microsoft/agent-framework
   ```

2. **Create Framework Config** (30 min)
   - Copy template from this doc
   - Update with our Key Vault secrets
   - Test initialization

3. **Register MCP Servers** (1 hour)
   - Install MCP server packages
   - Configure AWS, Azure, GCP servers
   - Test tool calling

4. **Migrate First Agent** (2 hours)
   - Start with `PlannerAgent`
   - Use new `Agent` class
   - Test with MCP servers

---

**Status**: ⚠️ **MIGRATION REQUIRED**  
**Priority**: **HIGH**  
**Impact**: **MAJOR** (Semantic Kernel in maintenance mode)  
**Est. Time**: **2-3 weeks** (parallel with other development)  
**Target**: **November 1, 2025**

🚀 **Let's build the future with Microsoft Agent Framework!**

