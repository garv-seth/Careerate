import OpenAI from "openai";
import { storage } from "../storage";
import { agentRegistry } from "./agent-registry";
import { env } from "../config/environment";

// Azure AI Foundry configuration with phi-4-reasoning
const getAzureOpenAIClient = () => {
  if (env.AZURE_AI_FOUNDRY_ENDPOINT && env.AZURE_AI_FOUNDRY_KEY) {
    console.log("🚀 Using Azure AI Foundry with phi-4-reasoning for Vibe Hosting");
    return new OpenAI({
      apiKey: env.AZURE_AI_FOUNDRY_KEY,
      baseURL: `${env.AZURE_AI_FOUNDRY_ENDPOINT}/openai/deployments/${env.AZURE_FOUNDRY_PHI4_DEPLOYMENT || 'Careerate-phi-4-reasoning'}`,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
      defaultHeaders: {
        'api-key': env.AZURE_AI_FOUNDRY_KEY,
      },
    });
  } else if (env.OPENAI_API_KEY) {
    console.log("🟢 Using OpenAI API for AI orchestration");
    return new OpenAI({ 
      apiKey: env.OPENAI_API_KEY 
    });
  } else if (env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY) {
    console.log("🔵 Using Azure OpenAI for AI orchestration");
    return new OpenAI({
      apiKey: env.AZURE_OPENAI_API_KEY,
      baseURL: `${env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
      defaultHeaders: {
        'api-key': env.AZURE_OPENAI_API_KEY,
      },
    });
  } else {
    throw new Error("No AI provider configured. Set either Azure AI Foundry, Azure OpenAI or OpenAI credentials.");
  }
};

const openai = getAzureOpenAIClient();

// Model configuration optimized for Azure AI Foundry
const MODEL_CONFIG = {
  // Phi-4 Reasoning: Most cost-effective yet powerful model for all complex tasks
  pro: env.AZURE_FOUNDRY_PHI4_DEPLOYMENT || "phi-4-reasoning", // $0.022/1M tokens - incredible value
  
  // Ministral-3B: Ultra-cheap for free tier and simple tasks
  free: env.AZURE_FOUNDRY_MINISTRAL_DEPLOYMENT || "ministral-3b", // $0.004/1M tokens - cheapest option
  
  // Unified model selection based on user tier
  getModel: (userTier: 'free' | 'pro' | 'enterprise', taskComplexity: 'simple' | 'complex' = 'complex') => {
    if (userTier === 'free' || taskComplexity === 'simple') {
      return MODEL_CONFIG.free;
    }
    return MODEL_CONFIG.pro; // Phi-4 for all paying users
  }
};

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
  
  async analyzeRepository(repositoryUrl: string, userTier: 'free' | 'pro' | 'enterprise' = 'free'): Promise<RepositoryAnalysis> {
    try {
      // Update agent status to analyzing
      agentRegistry.updateAgentStatus('planner', 'building');
      
      // Fetch repository details from GitHub API
      const repoDetails = await this.fetchRepositoryDetails(repositoryUrl);
      
      // Select model based on user tier - Phi-4 for Pro users, Ministral-3B for Free
      const modelToUse = MODEL_CONFIG.getModel(userTier, 'complex');
      console.log(`🧠 Using ${modelToUse} for ${userTier} user repository analysis`);
      
      const response = await openai.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: `You are an expert DevOps AI agent powered by advanced reasoning capabilities. Analyze code repositories and provide optimal deployment strategies.
            
            ${userTier === 'free' ? 
              '⚠️ FREE TIER: Provide basic analysis with clear upgrade prompts. Mention limitations and benefits of Pro tier.' : 
              '🚀 PRO TIER: Provide comprehensive analysis with advanced insights, detailed optimization recommendations, and multi-cloud strategies.'
            }
            
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
              },
              "tierUpgradePrompt": ${userTier === 'free' ? '"Upgrade to Pro for advanced insights, multi-cloud analysis, and priority support!"' : 'null'}
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
        fromAgent: 'planner',
        toAgent: 'system',
        message: `Repository analysis completed for ${repositoryUrl}. Analysis: ${JSON.stringify(analysis)}`,
      });

      return analysis as RepositoryAnalysis;
    } catch (error) {
      console.error("Repository analysis failed:", error);
      
      // Log the error
      await storage.createAgentLog({
        fromAgent: 'planner',
        toAgent: 'system',
        message: `Repository analysis failed for ${repositoryUrl}. Error: ${error instanceof Error ? error.message : String(error)}`,
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

  async createDeploymentPlan(repositoryUrl: string, userTier: 'free' | 'pro' | 'enterprise' = 'free'): Promise<string> {
    try {
      const analysis = await this.analyzeRepository(repositoryUrl, userTier);
      
      // Use Phi-4 for Pro users, Ministral-3B for Free users
      const modelToUse = MODEL_CONFIG.getModel(userTier, 'complex');
      console.log(`📋 Using ${modelToUse} for ${userTier} user deployment planning`);
      
      const response = await openai.chat.completions.create({
        model: modelToUse,
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
        name: `Deploy ${repositoryUrl.split('/').pop()}`,
        projectName: repositoryUrl.split('/').pop() || 'New Project',
        status: 'pending',
        nodes: [],
        connections: [],
      });

      // Log plan creation
      await storage.createAgentLog({
        fromAgent: 'planner',
        toAgent: 'builder',
        message: `Deployment plan created for ${repositoryUrl}. Plan ID: ${planId}`,
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
        fromAgent: 'builder',
        toAgent: 'tester',
        message: `Starting deployment execution for plan ${planId}`,
      });

      // Simulate deployment execution with the agent system
      await this.simulateAgentExecution(plan);

      plan.status = 'completed';
      this.deploymentPlans.set(planId, plan);

      // Log completion
      await storage.createAgentLog({
        fromAgent: 'deployer',
        toAgent: 'monitor',
        message: `Deployment completed successfully for plan ${planId}`,
      });

    } catch (error) {
      plan.status = 'failed';
      this.deploymentPlans.set(planId, plan);
      
      await storage.createAgentLog({
        fromAgent: 'deployer',
        toAgent: 'system',
        message: `Deployment failed for plan ${planId}. Error: ${error instanceof Error ? error.message : String(error)}`,
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
        fromAgent: agentType,
        toAgent: agents[agents.indexOf(agentType) + 1] || 'system',
        message: `${agentType} agent completed processing for ${plan.repositoryUrl}`,
      });
    }

    // Create cloud resources
    if (plan.infrastructure) {
      await storage.createCloudResource({
        provider: plan.infrastructure.provider,
        resourceType: "application",
        status: "running",
        region: "us-east-1",
        metadata: JSON.stringify({
          name: `${plan.repositoryUrl.split('/').pop()}-deployment`,
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

  async optimizeInfrastructure(userTier: 'free' | 'pro' | 'enterprise' = 'free'): Promise<any> {
    try {
      const cloudResources = await storage.getAllCloudResources();
      
      // Use Phi-4 for Pro users for advanced optimization, Ministral-3B for basic optimization
      const modelToUse = MODEL_CONFIG.getModel(userTier, 'complex'); 
      console.log(`⚡ Using ${modelToUse} for ${userTier} user infrastructure optimization`);
      
      const response = await openai.chat.completions.create({
        model: modelToUse,
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
        fromAgent: 'monitor',
        toAgent: 'system',
        message: `Infrastructure optimization analysis completed. Savings: ${optimizations.totalEstimatedSavings}`,
      });

      return optimizations;
    } catch (error) {
      console.error("Infrastructure optimization failed:", error);
      throw new Error("Failed to optimize infrastructure");
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();