# Careerate MCP (Model Context Protocol) Architecture

## Executive Summary

This document outlines the **Model Context Protocol (MCP) implementation** for Careerate's autonomous deployment platform. MCP provides a standardized interface for AI agents to discover, access, and execute deployment tools across 100+ cloud integrations.

## Why MCP?

**Current Limitations:**
- Agent tools are hardcoded in `agentTools.ts`
- No dynamic discovery of available integrations
- Inconsistent error handling across tools
- No standardized permission flow before execution
- Difficult to extend with new providers

**MCP Benefits:**
1. **Dynamic Tool Discovery** - Agents can query available tools at runtime
2. **Standardized Interface** - All integrations follow same protocol
3. **Permission Management** - User consent before sensitive operations
4. **Streaming Support** - Real-time progress for long-running deployments
5. **Interoperability** - Other AI systems can use Careerate tools

---

## MCP Server Architecture

### 1. Core Components

```typescript
// server/services/mcp/server.ts
export interface MCPServer {
  // Tool Management
  tools: {
    list(): Promise<MCPTool[]>;
    execute(toolName: string, params: any, context: ExecutionContext): Promise<MCPResult>;
  };

  // Resource Management (repos, deployments, databases)
  resources: {
    list(): Promise<MCPResource[]>;
    read(resourceUri: string): Promise<MCPResourceContent>;
    subscribe(resourceUri: string, callback: (update: any) => void): void;
  };

  // Prompt Templates
  prompts: {
    list(): Promise<MCPPrompt[]>;
    get(promptName: string, args?: Record<string, string>): Promise<string>;
  };

  // Server Info
  info(): Promise<MCPServerInfo>;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
    streaming: boolean;
  };
  integrations: {
    count: number;
    categories: string[];
  };
}
```

### 2. Tool Definition Schema

```typescript
export interface MCPTool {
  name: string;
  description: string;
  category: 'deployment' | 'database' | 'monitoring' | 'security' | 'networking' | 'ci-cd';
  provider: string; // 'aws', 'gcp', 'azure', 'vercel', etc.

  inputSchema: JSONSchema;
  outputSchema: JSONSchema;

  // Security & Permissions
  requiredPermissions: string[];
  requiresConfirmation: boolean;
  estimatedCost?: {
    min: number;
    max: number;
    currency: 'USD';
  };

  // Execution metadata
  estimatedDuration: number; // milliseconds
  supportsStreaming: boolean;
  idempotent: boolean;

  // Handler
  handler: (params: any, context: ExecutionContext) => Promise<MCPResult> | AsyncGenerator<MCPStreamUpdate>;
}

export interface ExecutionContext {
  userId: string;
  projectId: string;
  dryRun: boolean;
  permissions: Set<string>;
  onProgress?: (update: MCPStreamUpdate) => void;
}

export interface MCPResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    duration: number;
    cost?: number;
    resourcesCreated?: string[];
  };
}

export interface MCPStreamUpdate {
  type: 'progress' | 'log' | 'result';
  timestamp: number;
  data: any;
}
```

### 3. Resource Management

```typescript
export interface MCPResource {
  uri: string; // e.g., "deployment://aws-ecs/my-app", "database://neon/my-db"
  name: string;
  type: 'deployment' | 'database' | 'service' | 'configuration';
  provider: string;

  metadata: {
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'inactive' | 'error' | 'provisioning';
    tags: Record<string, string>;
  };

  // Read content
  content?: MCPResourceContent;

  // Subscribe to changes
  subscribable: boolean;
}

export interface MCPResourceContent {
  mimeType: string;
  data: string | Buffer | object;
  encoding?: 'utf-8' | 'base64';
}
```

### 4. Prompt Templates

```typescript
export interface MCPPrompt {
  name: string;
  description: string;
  category: string;

  template: string; // Template with {{variable}} placeholders
  variables: {
    name: string;
    description: string;
    required: boolean;
    default?: string;
  }[];

  examples: {
    input: Record<string, string>;
    output: string;
  }[];
}

// Example prompts
const DEPLOYMENT_PROMPTS: MCPPrompt[] = [
  {
    name: 'analyze_and_deploy',
    description: 'Analyze GitHub repo and suggest deployment strategy',
    category: 'deployment',
    template: `Analyze the repository at {{repo_url}} and suggest the best deployment strategy.

Consider:
- Framework and runtime requirements
- Database dependencies
- Expected traffic: {{traffic_level}}
- Budget constraint: ${{budget}}/month
- Regional requirements: {{region}}

Provide a detailed deployment plan with cost estimates.`,
    variables: [
      { name: 'repo_url', description: 'GitHub repository URL', required: true },
      { name: 'traffic_level', description: 'Expected traffic (low/medium/high)', required: true },
      { name: 'budget', description: 'Monthly budget in USD', required: false, default: '100' },
      { name: 'region', description: 'Deployment region', required: false, default: 'global' }
    ],
    examples: [
      {
        input: {
          repo_url: 'https://github.com/user/nextjs-app',
          traffic_level: 'medium',
          budget: '200'
        },
        output: '...'
      }
    ]
  }
];
```

---

## Implementation Plan

### Phase 1: MCP Server Core (Week 1)

**File:** `server/services/mcp/server.ts`

```typescript
import { agentTools } from '../agentTools';
import { executeAgentTool } from '../agentToolExecutors';
import { INTEGRATION_CATALOG } from '../integrationsCatalog';

class CareerateMCPServer implements MCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();

  constructor() {
    this.registerTools();
    this.registerPrompts();
  }

  async info(): Promise<MCPServerInfo> {
    return {
      name: 'careerate-mcp-server',
      version: '1.0.0',
      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
        streaming: true
      },
      integrations: {
        count: this.tools.size,
        categories: Array.from(new Set(Array.from(this.tools.values()).map(t => t.category)))
      }
    };
  }

  tools = {
    list: async (): Promise<MCPTool[]> => {
      return Array.from(this.tools.values());
    },

    execute: async (toolName: string, params: any, context: ExecutionContext): Promise<MCPResult> => {
      const tool = this.tools.get(toolName);
      if (!tool) {
        return {
          success: false,
          error: { code: 'TOOL_NOT_FOUND', message: `Tool ${toolName} not found` },
          metadata: { duration: 0 }
        };
      }

      // Permission check
      if (tool.requiresConfirmation && !context.permissions.has('execute:' + toolName)) {
        return {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'User confirmation required for this operation',
            details: { requiredPermissions: tool.requiredPermissions }
          },
          metadata: { duration: 0 }
        };
      }

      // Dry run mode
      if (context.dryRun) {
        return {
          success: true,
          data: { message: 'Dry run - no changes made', params },
          metadata: { duration: 0 }
        };
      }

      // Execute
      const startTime = Date.now();
      try {
        const result = await tool.handler(params, context);
        return {
          success: true,
          data: result,
          metadata: {
            duration: Date.now() - startTime,
            cost: tool.estimatedCost?.min
          }
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'EXECUTION_ERROR',
            message: (error as Error).message,
            details: error
          },
          metadata: { duration: Date.now() - startTime }
        };
      }
    }
  };

  resources = {
    list: async (): Promise<MCPResource[]> => {
      return Array.from(this.resources.values());
    },

    read: async (resourceUri: string): Promise<MCPResourceContent> => {
      const resource = this.resources.get(resourceUri);
      if (!resource || !resource.content) {
        throw new Error(`Resource ${resourceUri} not found or has no content`);
      }
      return resource.content;
    },

    subscribe: (resourceUri: string, callback: (update: any) => void): void => {
      // WebSocket-based subscription for real-time updates
      const ws = new WebSocket(`ws://localhost:5000/mcp/subscribe/${resourceUri}`);
      ws.onmessage = (event) => callback(JSON.parse(event.data));
    }
  };

  prompts = {
    list: async (): Promise<MCPPrompt[]> => {
      return Array.from(this.prompts.values());
    },

    get: async (promptName: string, args?: Record<string, string>): Promise<string> => {
      const prompt = this.prompts.get(promptName);
      if (!prompt) throw new Error(`Prompt ${promptName} not found`);

      let rendered = prompt.template;
      for (const variable of prompt.variables) {
        const value = args?.[variable.name] ?? variable.default ?? '';
        rendered = rendered.replace(new RegExp(`{{${variable.name}}}`, 'g'), value);
      }
      return rendered;
    }
  };

  private registerTools(): void {
    // Convert existing agent tools to MCP format
    for (const agentTool of agentTools) {
      const mcpTool: MCPTool = {
        name: agentTool.function.name,
        description: agentTool.function.description,
        category: this.categorizeTool(agentTool.function.name),
        provider: this.extractProvider(agentTool.function.name),
        inputSchema: agentTool.function.parameters as JSONSchema,
        outputSchema: { type: 'object' }, // TODO: Define output schemas
        requiredPermissions: [agentTool.function.name],
        requiresConfirmation: agentTool.function.name.includes('deploy') || agentTool.function.name.includes('provision'),
        estimatedDuration: this.estimateDuration(agentTool.function.name),
        supportsStreaming: false,
        idempotent: false,
        handler: async (params, context) => {
          return await executeAgentTool(agentTool.function.name, params);
        }
      };
      this.tools.set(mcpTool.name, mcpTool);
    }
  }

  private registerPrompts(): void {
    this.prompts.set('analyze_and_deploy', DEPLOYMENT_PROMPTS[0]);
  }

  private categorizeTool(toolName: string): MCPTool['category'] {
    if (toolName.includes('deploy')) return 'deployment';
    if (toolName.includes('provision') || toolName.includes('database')) return 'database';
    if (toolName.includes('monitoring') || toolName.includes('datadog')) return 'monitoring';
    if (toolName.includes('security')) return 'security';
    return 'deployment';
  }

  private extractProvider(toolName: string): string {
    if (toolName.includes('azure')) return 'azure';
    if (toolName.includes('aws')) return 'aws';
    if (toolName.includes('gcp')) return 'gcp';
    if (toolName.includes('vercel')) return 'vercel';
    if (toolName.includes('railway')) return 'railway';
    if (toolName.includes('neon')) return 'neon';
    return 'unknown';
  }

  private estimateDuration(toolName: string): number {
    if (toolName.includes('deploy')) return 180000; // 3 minutes
    if (toolName.includes('analyze')) return 10000; // 10 seconds
    if (toolName.includes('provision')) return 60000; // 1 minute
    return 30000; // 30 seconds default
  }
}

export const mcpServer = new CareerateMCPServer();
```

### Phase 2: MCP HTTP/WebSocket API (Week 1-2)

**File:** `server/services/mcp/api.ts`

```typescript
import express from 'express';
import { WebSocketServer } from 'ws';
import { mcpServer } from './server';

export function setupMCPApi(app: express.Application) {
  // Tool Discovery
  app.get('/api/mcp/tools', async (req, res) => {
    const tools = await mcpServer.tools.list();
    res.json({ tools });
  });

  // Tool Execution
  app.post('/api/mcp/tools/:toolName/execute', async (req, res) => {
    const { toolName } = req.params;
    const { params, dryRun = false } = req.body;

    const context: ExecutionContext = {
      userId: req.user?.id || 'anonymous',
      projectId: req.body.projectId || '',
      dryRun,
      permissions: new Set(req.body.permissions || [])
    };

    const result = await mcpServer.tools.execute(toolName, params, context);
    res.json(result);
  });

  // Resource Listing
  app.get('/api/mcp/resources', async (req, res) => {
    const resources = await mcpServer.resources.list();
    res.json({ resources });
  });

  // Resource Content
  app.get('/api/mcp/resources/:uri(*)', async (req, res) => {
    try {
      const content = await mcpServer.resources.read(req.params.uri);
      res.set('Content-Type', content.mimeType);
      res.send(content.data);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  });

  // Prompt Templates
  app.get('/api/mcp/prompts', async (req, res) => {
    const prompts = await mcpServer.prompts.list();
    res.json({ prompts });
  });

  app.post('/api/mcp/prompts/:promptName/render', async (req, res) => {
    const rendered = await mcpServer.prompts.get(req.params.promptName, req.body.variables);
    res.json({ rendered });
  });

  // Server Info
  app.get('/api/mcp/info', async (req, res) => {
    const info = await mcpServer.info();
    res.json(info);
  });
}

export function setupMCPWebSocket(server: any) {
  const wss = new WebSocketServer({ server, path: '/mcp/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', async (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'subscribe') {
        // Subscribe to resource updates
        mcpServer.resources.subscribe(message.resourceUri, (update) => {
          ws.send(JSON.stringify({ type: 'update', data: update }));
        });
      }

      if (message.type === 'execute_streaming') {
        // Streaming tool execution
        const context: ExecutionContext = {
          ...message.context,
          onProgress: (update: MCPStreamUpdate) => {
            ws.send(JSON.stringify({ type: 'progress', data: update }));
          }
        };

        const result = await mcpServer.tools.execute(
          message.toolName,
          message.params,
          context
        );

        ws.send(JSON.stringify({ type: 'result', data: result }));
      }
    });
  });
}
```

### Phase 3: Permission & Confirmation Flow (Week 2)

**File:** `server/services/mcp/permissions.ts`

```typescript
export interface PermissionRequest {
  id: string;
  userId: string;
  toolName: string;
  params: any;
  estimatedCost?: { min: number; max: number };
  requiredPermissions: string[];
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

class PermissionManager {
  private requests = new Map<string, PermissionRequest>();

  async requestPermission(
    userId: string,
    toolName: string,
    params: any,
    tool: MCPTool
  ): Promise<PermissionRequest> {
    const request: PermissionRequest = {
      id: `perm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId,
      toolName,
      params,
      estimatedCost: tool.estimatedCost,
      requiredPermissions: tool.requiredPermissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      status: 'pending'
    };

    this.requests.set(request.id, request);

    // Notify user via WebSocket
    this.notifyUser(userId, {
      type: 'permission_request',
      data: request
    });

    return request;
  }

  async approvePermission(requestId: string, userId: string): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.userId !== userId) return false;

    if (request.status !== 'pending' || new Date() > request.expiresAt) {
      request.status = 'expired';
      return false;
    }

    request.status = 'approved';
    return true;
  }

  async denyPermission(requestId: string, userId: string): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.userId !== userId) return false;

    request.status = 'denied';
    return true;
  }

  private notifyUser(userId: string, notification: any): void {
    // Send via WebSocket or Server-Sent Events
    // Implementation depends on notification service
  }
}

export const permissionManager = new PermissionManager();
```

---

## Integration with Existing System

### 1. Backwards Compatibility

**Existing agent tools continue to work:**
- `agentTools.ts` remains unchanged
- `agentToolExecutors.ts` handlers are wrapped by MCP
- No breaking changes to existing deployments

### 2. Gradual Migration

```typescript
// Old way (still works)
await executeAgentTool('deploy_to_azure_container_apps', { appName: 'my-app', ... });

// New MCP way (enhanced with permissions, streaming, etc.)
await mcpServer.tools.execute(
  'deploy_to_azure_container_apps',
  { appName: 'my-app', ... },
  {
    userId: user.id,
    projectId: project.id,
    dryRun: false,
    permissions: new Set(['deploy:azure'])
  }
);
```

### 3. Dynamic Tool Registration

```typescript
// Auto-register new deployers
export function registerDeployer(config: DeployerConfig): void {
  const mcpTool: MCPTool = {
    name: `deploy_to_${config.provider}_${config.service}`,
    description: config.description,
    category: 'deployment',
    provider: config.provider,
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    requiredPermissions: [`deploy:${config.provider}`],
    requiresConfirmation: true,
    estimatedDuration: config.estimatedDuration,
    supportsStreaming: config.supportsStreaming,
    idempotent: false,
    handler: config.handler
  };

  mcpServer.registerTool(mcpTool);
}

// Usage
registerDeployer({
  provider: 'aws',
  service: 'ecs',
  description: 'Deploy to AWS ECS Fargate',
  inputSchema: { ... },
  handler: deployToAwsEcs
});
```

---

## Benefits Summary

1. **Scalability** - Add 100+ integrations without modifying core code
2. **Transparency** - Users see exactly what tools will do before execution
3. **Security** - Permission system prevents unauthorized operations
4. **Interoperability** - Other AI agents can discover and use Careerate tools
5. **Streaming** - Real-time progress for deployments (no more waiting in the dark)
6. **Cost Awareness** - Show estimated costs before user confirms
7. **Dry Run Mode** - Test deployments without actually provisioning resources

---

## Next Steps

1. ✅ Document MCP architecture
2. ⏭️ Implement MCP server core (`server/services/mcp/server.ts`)
3. ⏭️ Add HTTP/WebSocket API endpoints
4. ⏭️ Build permission management system
5. ⏭️ Create UI components for permission requests
6. ⏭️ Migrate existing tools to MCP format
7. ⏭️ Add streaming support for long-running operations
8. ⏭️ Build resource subscription system for real-time updates

---

**Last Updated:** 2025-10-05
**Status:** Architecture Defined, Implementation Pending
**Target:** Production-ready MCP server with 100+ tools
