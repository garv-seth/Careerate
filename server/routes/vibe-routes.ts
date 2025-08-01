import { Router } from "express";
import { vibeOrchestrator } from "../agents/vibe-agents/orchestrator";
import { integrationManager } from "../agents/vibe-agents/integrations";
import { storage } from "../storage";

export const vibeRouter = Router();

// Process natural language deployment command
vibeRouter.post("/deploy", async (req, res) => {
  try {
    const { command } = req.body;
    const userId = req.session?.userId || "anonymous";
    
    if (!command) {
      return res.status(400).json({ error: "Deployment command is required" });
    }

    // Process the command with our Vibe orchestrator
    const plan = await vibeOrchestrator.processVibeCommand(command, userId);
    
    // Store the deployment plan
    await storage.createWorkflow({
      name: `Vibe Deployment: ${command.substring(0, 50)}...`,
      projectName: plan.infrastructure.provider,
      status: "pending",
      nodes: [],
      connections: [],
    });

    res.json({
      success: true,
      plan,
      message: "Deployment plan created successfully! Review and execute when ready."
    });
  } catch (error) {
    console.error("Vibe deployment error:", error);
    res.status(500).json({ 
      error: "Failed to process deployment command",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Execute a deployment plan
vibeRouter.post("/execute/:planId", async (req, res) => {
  try {
    const { planId } = req.params;
    
    // In production, this would execute the actual deployment
    await vibeOrchestrator.executeDeployment(planId as any);
    
    res.json({
      success: true,
      message: "Deployment started successfully!"
    });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ 
      error: "Failed to execute deployment",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get available integrations
vibeRouter.get("/integrations", (req, res) => {
  const integrations = integrationManager.getAvailableIntegrations();
  const details = integrations.map(type => ({
    type,
    ...integrationManager.getIntegrationDetails(type)
  }));
  
  res.json({
    integrations: details,
    total: details.length
  });
});

// Configure an integration
vibeRouter.post("/integrations/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const config = req.body;
    
    await integrationManager.setupIntegration(type, {
      type,
      ...config
    });
    
    const testResult = await integrationManager.testIntegration(type);
    
    res.json({
      success: true,
      integration: type,
      status: testResult ? "connected" : "failed",
      message: testResult ? "Integration configured successfully!" : "Integration test failed"
    });
  } catch (error) {
    console.error("Integration setup error:", error);
    res.status(500).json({ 
      error: "Failed to configure integration",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Natural language examples endpoint
vibeRouter.get("/examples", (req, res) => {
  res.json({
    examples: [
      {
        command: "Deploy my React app with a Postgres database to AWS",
        description: "Sets up EC2, RDS, and Load Balancer on AWS"
      },
      {
        command: "Create a Kubernetes cluster for my microservices on Azure",
        description: "Provisions AKS with auto-scaling and monitoring"
      },
      {
        command: "Deploy a Node.js API with Redis caching to Google Cloud",
        description: "Sets up Cloud Run, Cloud Redis, and Cloud CDN"
      },
      {
        command: "Set up CI/CD for my GitHub repo with automated testing",
        description: "Creates GitHub Actions workflow with test automation"
      },
      {
        command: "Deploy my app to multiple clouds for redundancy",
        description: "Multi-cloud deployment across AWS, Azure, and GCP"
      }
    ]
  });
});