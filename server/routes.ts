import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertWorkflowSchema, insertAgentLogSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiOrchestrator } from "./agents/ai-orchestrator";
import { infrastructureOrchestrator } from "./infrastructure/cloud-providers";
import { agentRegistry } from "./agents/agent-registry";
import authRoutes from "./auth/auth-routes";
import { env } from "./config/environment";
import { testDatabaseConnection } from "./db";

// Helper function to check service health status
async function getServiceHealthStatus() {
  const services: any = {};
  
  // Database health
  try {
    await testDatabaseConnection();
    services.database = { status: 'healthy', latency: 'low' };
  } catch (error) {
    services.database = { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
  
  // AI Service health
  const hasAzureOpenAI = env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY && env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const hasOpenAI = env.OPENAI_API_KEY;
  
  services.ai = {
    status: (hasAzureOpenAI || hasOpenAI) ? 'configured' : 'not_configured',
    provider: hasAzureOpenAI ? 'azure_openai' : hasOpenAI ? 'openai' : 'none',
    models: hasAzureOpenAI ? 'gpt-4o-mini, gpt-35-turbo' : hasOpenAI ? 'gpt-4o-mini' : 'none'
  };
  
  // Agent Registry health
  try {
    const agents = agentRegistry.getAgents();
    services.agents = {
      status: 'healthy',
      count: agents.length,
      active: agents.filter(a => a.status === 'active').length
    };
  } catch (error) {
    services.agents = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
  
  // Cloud Providers health
  services.cloudProviders = {
    aws: env.AWS_ACCESS_KEY_ID ? 'configured' : 'not_configured',
    gcp: env.GOOGLE_APPLICATION_CREDENTIALS || env.GOOGLE_CLOUD_PROJECT ? 'configured' : 'not_configured',
    azure: env.AZURE_CLIENT_ID ? 'configured' : 'not_configured'
  };
  
  return services;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health Check Endpoints (required for Azure Web App)
  app.get('/health', async (req, res) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: 'checking...',
          ai: 'checking...',
          agents: 'checking...'
        }
      };

      // Test database connection
      try {
        await testDatabaseConnection();
        healthStatus.services.database = 'healthy';
      } catch (error) {
        healthStatus.services.database = 'unhealthy';
        healthStatus.status = 'degraded';
      }

      // Test AI service connection
      try {
        const hasAzureOpenAI = env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY && env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const hasOpenAI = env.OPENAI_API_KEY;
        
        if (hasAzureOpenAI) {
          healthStatus.services.ai = 'azure_openai_configured';
        } else if (hasOpenAI) {
          healthStatus.services.ai = 'openai_configured';
        } else {
          healthStatus.services.ai = 'not_configured';
          healthStatus.status = 'degraded';
        }
      } catch (error) {
        healthStatus.services.ai = 'error';
      }

      // Check agent registry
      try {
        const agents = agentRegistry.getAgents();
        healthStatus.services.agents = `${agents.length} agents registered`;
      } catch (error) {
        healthStatus.services.agents = 'error';
      }

      // Return appropriate status code
      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Readiness probe (for Kubernetes/container orchestration)
  app.get('/ready', async (req, res) => {
    try {
      await testDatabaseConnection();
      res.status(200).json({ 
        status: 'ready',
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Database not ready'
      });
    }
  });

  // Liveness probe
  app.get('/live', (req, res) => {
    res.status(200).json({ 
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API Health endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const stats = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        system: {
          node_version: process.version,
          platform: process.platform,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
          },
          uptime: Math.round(process.uptime())
        },
        services: await getServiceHealthStatus()
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed'
      });
    }
  });

  // Setup Replit Authentication
  await setupAuth(app);

  // OAuth Authentication routes
  app.use('/api', authRoutes);

  // Simple demo login route for development
  app.get('/api/login', async (req, res) => {
    try {
      // Create a demo user for development
      const demoUser = {
        id: 'demo-user-123',
        username: 'demo-user',
        name: 'Demo Developer',
        email: 'demo@careerate.dev',
        provider: 'demo'
      };
      
      // Store user session
      req.session = req.session || {};
      (req.session as any).user = demoUser;
      (req.session as any).isAuthenticated = true;
      
      // Upsert demo user to storage
      await storage.upsertUser({
        id: demoUser.id,
        firstName: 'Demo',
        lastName: 'Developer',
        email: demoUser.email,
        profileImageUrl: null
      });
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
      res.status(500).json({ error: 'Demo login failed' });
    }
  });

  // Logout route
  app.post('/api/logout', async (req, res) => {
    try {
      req.session?.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const session = req.session as any;
      if (session?.isAuthenticated && session?.user) {
        res.json(session.user);
      } else {
        res.status(401).json({ error: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Cloud Resources API
  app.get("/api/cloud-resources", async (req, res) => {
    try {
      const resources = await storage.getAllCloudResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cloud resources" });
    }
  });

  app.get("/api/cloud-resources/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const resources = await storage.getCloudResourcesByProvider(provider);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cloud resources" });
    }
  });

  // Workflow API
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getAllWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create workflow" });
      }
    }
  });

  // Agent Logs API
  app.get("/api/agent-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getAgentLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent logs" });
    }
  });

  // AI Orchestration API
  app.post("/api/deploy/analyze", isAuthenticated, async (req, res) => {
    try {
      const { repositoryUrl } = req.body;
      if (!repositoryUrl) {
        return res.status(400).json({ message: "Repository URL is required" });
      }
      
      // Log analysis start
      console.log(`[AI-ORCHESTRATOR] Starting analysis for repository: ${repositoryUrl}`);
      
      const analysis = await aiOrchestrator.analyzeRepository(repositoryUrl);
      
      // Log analysis completion
      console.log(`[AI-ORCHESTRATOR] Analysis completed for repository: ${repositoryUrl}`);
      
      res.json(analysis);
    } catch (error) {
      console.error("Repository analysis failed:", error);
      res.status(500).json({ message: "Failed to analyze repository" });
    }
  });

  app.post("/api/deploy/plan", isAuthenticated, async (req, res) => {
    try {
      const { repositoryUrl } = req.body;
      if (!repositoryUrl) {
        return res.status(400).json({ message: "Repository URL is required" });
      }
      
      // Log deployment plan creation
      console.log(`[AI-ORCHESTRATOR] Creating deployment plan for repository: ${repositoryUrl}`);
      
      const planId = await aiOrchestrator.createDeploymentPlan(repositoryUrl);
      
      // Log deployment plan completion
      console.log(`[AI-ORCHESTRATOR] Deployment plan created with ID: ${planId}`);
      
      res.json({ planId, message: "Deployment plan created successfully" });
    } catch (error) {
      console.error("Deployment plan creation failed:", error);
      res.status(500).json({ message: "Failed to create deployment plan" });
    }
  });

  app.post("/api/deploy/execute/:planId", async (req, res) => {
    try {
      const { planId } = req.params;
      await aiOrchestrator.executeDeploymentPlan(planId);
      res.json({ message: "Deployment execution started" });
    } catch (error) {
      console.error("Deployment execution failed:", error);
      res.status(500).json({ message: "Failed to execute deployment" });
    }
  });

  app.get("/api/deploy/plans", async (req, res) => {
    try {
      const plans = aiOrchestrator.getAllDeploymentPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deployment plans" });
    }
  });

  app.get("/api/deploy/plans/:planId", async (req, res) => {
    try {
      const { planId } = req.params;
      const plan = aiOrchestrator.getDeploymentPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Deployment plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deployment plan" });
    }
  });

  // Infrastructure Optimization API
  app.post("/api/infrastructure/optimize", async (req, res) => {
    try {
      const optimizations = await aiOrchestrator.optimizeInfrastructure();
      res.json(optimizations);
    } catch (error) {
      console.error("Infrastructure optimization failed:", error);
      res.status(500).json({ message: "Failed to optimize infrastructure" });
    }
  });

  app.get("/api/infrastructure/status", async (req, res) => {
    try {
      const status = await infrastructureOrchestrator.getAllProvidersStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch infrastructure status" });
    }
  });

  // Real GitHub Integration API
  app.post("/api/integrations/github/repos", async (req, res) => {
    try {
      const { access_token } = req.body;
      if (!access_token) {
        return res.status(400).json({ message: "GitHub access token required" });
      }
      
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `token ${access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const repos = await response.json();
      res.json(repos);
    } catch (error) {
      console.error("GitHub API error:", error);
      res.status(500).json({ message: "Failed to fetch GitHub repositories" });
    }
  });

  // Agent routes with real functionality
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      // Add real-time agent status from registry
      const agentStatuses = agentRegistry.getAgents();
      const enhancedAgents = agents.map((agent: any) => {
        const registryAgent = agentStatuses.find((a: any) => a.name === agent.name);
        return {
          ...agent,
          status: registryAgent?.status || agent.status,
          capabilities: registryAgent?.capabilities || [],
          taskId: registryAgent?.taskId || null
        };
      });
      res.json(enhancedAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const agent = await storage.updateAgent(id, updates);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  // Workflow routes
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getAllWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  // Cloud resources routes
  app.get("/api/cloud-resources", async (req, res) => {
    try {
      const provider = req.query.provider as string;
      const resources = provider 
        ? await storage.getCloudResourcesByProvider(provider)
        : await storage.getAllCloudResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cloud resources" });
    }
  });

  // Agent logs routes
  app.get("/api/agent-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await storage.getAgentLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent logs" });
    }
  });

  app.post("/api/agent-logs", async (req, res) => {
    try {
      const validatedData = insertAgentLogSchema.parse(req.body);
      const log = await storage.createAgentLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent log" });
    }
  });

  // Dashboard stats routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      const cloudResources = await storage.getAllCloudResources();
      const logs = await storage.getAgentLogs(10);

      const activeAgents = agents.filter(agent => agent.status === "active").length;
      const totalAgents = agents.length;
      const queueDepth = agents.filter(agent => agent.status === "queued").length;

      const totalCost = cloudResources.reduce((sum, resource) => sum + (resource.cost || 0), 0);
      const costByType = cloudResources.reduce((acc, resource) => {
        acc[resource.resourceType] = (acc[resource.resourceType] || 0) + (resource.cost || 0);
        return acc;
      }, {} as Record<string, number>);

      const healthScore = Math.round((activeAgents / totalAgents) * 100);
      const responseTime = Math.floor(Math.random() * 50) + 100; // Simulated response time
      const activeEndpoints = cloudResources.filter(r => r.status === "active").length;
      const totalEndpoints = cloudResources.length;

      res.json({
        agents: {
          active: activeAgents,
          total: totalAgents,
          queueDepth,
          successRate: 98.7
        },
        cost: {
          total: totalCost,
          byType: costByType,
          monthlyChange: -12
        },
        health: {
          score: healthScore,
          responseTime,
          activeEndpoints,
          totalEndpoints
        },
        recentLogs: logs
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // A2A Protocol Test - demonstrates interacting vibe hosting
  app.get("/api/agents/a2a-test", async (req, res) => {
    try {
      const taskId = `vibe-task-${Date.now()}`;
      console.log(`[CAREERATE] 🚀 A2A protocol demonstration - interacting vibe hosting`);
      
      const result = await agentRegistry.executeTask(taskId, {
        repo: "https://github.com/careerate/demo-app",
        environment: "production", 
        cloudProviders: ["aws", "gcp", "azure"],
        vibeCoding: true,
        autonomousLevel: "full"
      });
      
      res.json({
        success: true,
        ...result,
        message: "A2A Protocol successfully demonstrated",
        vibeHosting: "Agents interacting autonomously through advanced protocols",
        competitiveEdge: "True multi-agent coordination beyond StarSling (YC) & Monk.io",
        tagline: "interacting vibe hosting - the future is autonomous"
      });
    } catch (error: any) {
      console.error('[CAREERATE] A2A test error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}