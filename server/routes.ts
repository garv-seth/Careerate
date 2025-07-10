import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertWorkflowSchema, insertAgentLogSchema } from "@shared/schema";
import { z } from "zod";
import authRoutes from "./auth/auth-routes";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Authentication routes
  app.use("/api", authRoutes);
  
  // Agent routes
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
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

  const httpServer = createServer(app);
  return httpServer;
}
