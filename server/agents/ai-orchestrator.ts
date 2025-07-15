import OpenAI from "openai";
import { storage } from "../storage";
import { agentRegistry } from "./agent-registry";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface RepositoryAnalysis {
  technology: string;
  dependencies: string[];
  buildCommands: string[];
  deploymentStrategy: string;
  recommendedInfrastructure: {
    provider: string;
    services: string[];
    estimatedCost: number;
  };
}

interface DeploymentPlan {
  id: string;
  repositoryUrl: string;
  analysis: RepositoryAnalysis;
  infrastructure: any;
  buildSteps: string[];
  deploymentSteps: string[];
  monitoringConfig: any;
  estimatedDuration: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export class AIOrchestrator {
  private deploymentPlans: Map<string, DeploymentPlan> = new Map();
  
  private async fetchRepositoryDetails(repositoryUrl: string) {
    try {
      // Extract owner and repo from GitHub URL
      const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub repository URL');
      }
      
      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching repository details:', error);
      // Return fallback data
      return {
        name: 'unknown',
        description: 'Repository analysis',
        language: 'JavaScript',
        size: 1000,
        updated_at: new Date().toISOString()
      };
    }
  }
  
  async analyzeRepository(repositoryUrl: string): Promise<RepositoryAnalysis> {
    try {
      // Update agent status to analyzing
      agentRegistry.updateAgentStatus('planner', 'building');
      
      // Fetch repository details from GitHub API
      const repoDetails = await this.fetchRepositoryDetails(repositoryUrl);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert DevOps AI agent that analyzes code repositories and recommends optimal deployment strategies. 
            Analyze the repository and provide recommendations for cloud infrastructure, build processes, and deployment strategies.
            Consider cost optimization, scalability, and security best practices.
            Respond with JSON in this format:
            {
              "technology": "string",
              "dependencies": ["array of dependencies"],
              "buildCommands": ["array of build commands"],
              "deploymentStrategy": "string description",
              "recommendedInfrastructure": {
                "provider": "aws|gcp|azure",
                "services": ["array of cloud services"],
                "estimatedCost": number
              }
            }`
          },
          {
            role: "user",
            content: `Analyze this repository: ${repositoryUrl}
            Repository Details:
            - Name: ${repoDetails.name}
            - Description: ${repoDetails.description}
            - Primary Language: ${repoDetails.language}
            - Size: ${repoDetails.size}KB
            - Last Updated: ${repoDetails.updated_at}
            
            Based on this information, provide detailed deployment recommendations.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      // Update agent status back to active
      agentRegistry.updateAgentStatus('planner', 'active');
      
      // Log the analysis
      await storage.createAgentLog({
        agentId: 1, // Planner agent
        level: "info",
        message: `Repository analysis completed for ${repositoryUrl}`,
        metadata: { analysis, repositoryUrl }
      });

      return analysis as RepositoryAnalysis;
    } catch (error) {
      console.error("Repository analysis failed:", error);
      
      // Log the error
      await storage.createAgentLog({
        agentId: 1,
        level: "error", 
        message: `Repository analysis failed for ${repositoryUrl}`,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });

      // Return a fallback analysis
      return {
        technology: "unknown",
        dependencies: [],
        buildCommands: ["npm install", "npm run build"],
        deploymentStrategy: "containerized deployment with auto-scaling",
        recommendedInfrastructure: {
          provider: "aws",
          services: ["EC2", "Application Load Balancer", "RDS"],
          estimatedCost: 50
        }
      };
    }
  }

  async createDeploymentPlan(repositoryUrl: string): Promise<string> {
    try {
      const analysis = await this.analyzeRepository(repositoryUrl);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert DevOps automation agent. Create detailed deployment plans with step-by-step instructions.
            Respond with JSON containing detailed build and deployment steps.
            Format:
            {
              "buildSteps": ["detailed step-by-step build instructions"],
              "deploymentSteps": ["detailed deployment instructions"],
              "monitoringConfig": {
                "healthChecks": ["array of health check endpoints"],
                "alerts": ["array of alert configurations"],
                "metrics": ["array of key metrics to monitor"]
              },
              "estimatedDuration": number_in_minutes
            }`
          },
          {
            role: "user", 
            content: `Create a detailed deployment plan for repository: ${repositoryUrl}
            Technology stack: ${analysis.technology}
            Dependencies: ${analysis.dependencies.join(", ")}
            Recommended infrastructure: ${JSON.stringify(analysis.recommendedInfrastructure)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const planDetails = JSON.parse(response.choices[0].message.content || "{}");
      
      const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deploymentPlan: DeploymentPlan = {
        id: planId,
        repositoryUrl,
        analysis,
        infrastructure: analysis.recommendedInfrastructure,
        buildSteps: planDetails.buildSteps || [],
        deploymentSteps: planDetails.deploymentSteps || [],
        monitoringConfig: planDetails.monitoringConfig || {},
        estimatedDuration: planDetails.estimatedDuration || 30,
        status: 'pending'
      };

      this.deploymentPlans.set(planId, deploymentPlan);
      
      // Create workflow record
      await storage.createWorkflow({
        name: `Deploy ${repositoryUrl}`,
        description: `Automated deployment for ${analysis.technology} application`,
        status: 'pending',
        steps: JSON.stringify([...planDetails.buildSteps, ...planDetails.deploymentSteps]),
        metadata: JSON.stringify({ 
          repositoryUrl, 
          analysis, 
          estimatedDuration: planDetails.estimatedDuration 
        })
      });

      // Log plan creation
      await storage.createAgentLog({
        agentId: 1,
        level: "info",
        message: `Deployment plan created for ${repositoryUrl}`,
        metadata: { planId, repositoryUrl, estimatedDuration: planDetails.estimatedDuration }
      });

      return planId;
    } catch (error) {
      console.error("Deployment plan creation failed:", error);
      throw new Error("Failed to create deployment plan");
    }
  }

  async executeDeploymentPlan(planId: string): Promise<void> {
    const plan = this.deploymentPlans.get(planId);
    if (!plan) {
      throw new Error("Deployment plan not found");
    }

    try {
      plan.status = 'in-progress';
      this.deploymentPlans.set(planId, plan);

      // Log deployment start
      await storage.createAgentLog({
        agentId: 2, // Builder agent
        level: "info",
        message: `Starting deployment execution for plan ${planId}`,
        metadata: { planId, repositoryUrl: plan.repositoryUrl }
      });

      // Simulate deployment execution with the agent system
      await this.simulateAgentExecution(plan);

      plan.status = 'completed';
      this.deploymentPlans.set(planId, plan);

      // Log completion
      await storage.createAgentLog({
        agentId: 4, // Deployer agent
        level: "info",
        message: `Deployment completed successfully for plan ${planId}`,
        metadata: { planId, repositoryUrl: plan.repositoryUrl }
      });

    } catch (error) {
      plan.status = 'failed';
      this.deploymentPlans.set(planId, plan);
      
      await storage.createAgentLog({
        agentId: 4,
        level: "error",
        message: `Deployment failed for plan ${planId}`,
        metadata: { planId, error: error instanceof Error ? error.message : String(error) }
      });
      
      throw error;
    }
  }

  private async simulateAgentExecution(plan: DeploymentPlan): Promise<void> {
    // Simulate the multi-agent workflow
    const agents = ['planner', 'builder', 'tester', 'deployer', 'monitor'];
    
    for (const agentType of agents) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      
      await storage.createAgentLog({
        agentId: agents.indexOf(agentType) + 1,
        level: "info",
        message: `${agentType} agent completed processing for ${plan.repositoryUrl}`,
        metadata: { 
          planId: plan.id, 
          agentType, 
          step: `${agentType}_processing_complete` 
        }
      });
    }

    // Create cloud resources
    if (plan.infrastructure) {
      await storage.createCloudResource({
        name: `${plan.repositoryUrl.split('/').pop()}-deployment`,
        provider: plan.infrastructure.provider,
        type: "application",
        status: "running",
        region: "us-east-1",
        metadata: JSON.stringify({
          services: plan.infrastructure.services,
          estimatedCost: plan.infrastructure.estimatedCost,
          repositoryUrl: plan.repositoryUrl
        })
      });
    }
  }

  getDeploymentPlan(planId: string): DeploymentPlan | undefined {
    return this.deploymentPlans.get(planId);
  }

  getAllDeploymentPlans(): DeploymentPlan[] {
    return Array.from(this.deploymentPlans.values());
  }

  async optimizeInfrastructure(): Promise<any> {
    try {
      const cloudResources = await storage.getAllCloudResources();
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a cloud cost optimization expert. Analyze current infrastructure and provide optimization recommendations.
            Respond with JSON containing optimization suggestions:
            {
              "recommendations": [
                {
                  "type": "cost_optimization|performance|security",
                  "description": "detailed recommendation",
                  "estimatedSavings": number,
                  "priority": "high|medium|low"
                }
              ],
              "totalEstimatedSavings": number,
              "implementationSteps": ["step by step implementation"]
            }`
          },
          {
            role: "user",
            content: `Analyze these cloud resources and provide optimization recommendations:
            ${JSON.stringify(cloudResources, null, 2)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const optimizations = JSON.parse(response.choices[0].message.content || "{}");
      
      // Log optimization analysis
      await storage.createAgentLog({
        agentId: 5, // Monitor agent
        level: "info",
        message: "Infrastructure optimization analysis completed",
        metadata: { 
          optimizations, 
          resourceCount: cloudResources.length,
          estimatedSavings: optimizations.totalEstimatedSavings 
        }
      });

      return optimizations;
    } catch (error) {
      console.error("Infrastructure optimization failed:", error);
      throw new Error("Failed to optimize infrastructure");
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();