/**
 * DEPLOYMENT PLAN SERVICE
 * Handles natural language to deployment plan generation
 */

import OpenAI from "openai";
import { storage } from "../storage";
import { githubService } from "./githubService";
import type { InsertDeploymentPlan } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR
});

interface PlanGenerationInput {
  userId: string;
  projectId: string;
  nlInput: string;
  repositoryInfo?: {
    owner: string;
    repo: string;
    framework?: string;
    language?: string;
  };
  context?: {
    existingResources?: any[];
    preferences?: any;
  };
}

interface GeneratedPlan {
  name: string;
  description: string;
  provider: string;
  region: string;
  estimatedCost: {
    monthly: number;
    setup: number;
    currency: string;
    breakdown: any[];
  };
  resources: Array<{
    type: string;
    name: string;
    configuration: any;
    estimatedCost?: number;
  }>;
  configuration: any;
  rationale: string;
}

export class DeploymentPlanService {

  /**
   * Generate deployment plan from natural language input
   */
  async generatePlanFromNL(input: PlanGenerationInput): Promise<string> {
    try {
      // Get repository information if provided
      let repoContext = '';
      if (input.repositoryInfo) {
        repoContext = `
Repository Information:
- Owner: ${input.repositoryInfo.owner}
- Repository: ${input.repositoryInfo.repo}
- Framework: ${input.repositoryInfo.framework || 'unknown'}
- Language: ${input.repositoryInfo.language || 'unknown'}
`;
      }

      const systemPrompt = `You are an expert cloud infrastructure architect. Generate a detailed deployment plan based on the user's natural language request.

Analyze the requirements and recommend the best cloud provider, region, resources, and configuration.

Consider:
1. Cost optimization (choose the most cost-effective option)
2. Performance requirements
3. Geographic location preferences
4. Scaling needs
5. Application framework and requirements

Supported Providers: AWS, Azure, GCP, Vercel (for frontend), Railway (for full-stack)

Return a JSON object with this structure:
{
  "name": "Short descriptive name",
  "description": "Detailed description of what will be deployed",
  "provider": "aws|azure|gcp|vercel|railway",
  "region": "specific region code",
  "estimatedCost": {
    "monthly": 0,
    "setup": 0,
    "currency": "USD",
    "breakdown": [
      { "item": "Compute", "cost": 0 },
      { "item": "Storage", "cost": 0 },
      { "item": "Network", "cost": 0 }
    ]
  },
  "resources": [
    {
      "type": "compute|database|storage|cdn|load-balancer",
      "name": "resource-name",
      "configuration": {
        // provider-specific config
      },
      "estimatedCost": 0
    }
  ],
  "configuration": {
    // deployment-specific configuration
    "buildCommand": "npm run build",
    "startCommand": "npm start",
    "port": 3000,
    "environmentVariables": {},
    "healthCheckPath": "/health",
    "autoscaling": {
      "enabled": true,
      "min": 1,
      "max": 10,
      "targetCPU": 70
    }
  },
  "rationale": "Explain why this provider/configuration was chosen"
}`;

      const userPrompt = `${input.nlInput}

${repoContext}

Generate a production-ready deployment plan.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4000,
        temperature: 0.3, // Lower temperature for more consistent planning
      });

      const plan = JSON.parse(response.choices[0].message.content || "{}") as GeneratedPlan;

      // Create deployment plan record
      const deploymentPlan = await storage.createDeploymentPlan({
        projectId: input.projectId,
        userId: input.userId,
        name: plan.name,
        description: plan.description,
        nlInput: input.nlInput,
        status: "pending",
        provider: plan.provider,
        region: plan.region,
        estimatedCost: plan.estimatedCost,
        resources: plan.resources,
        configuration: plan.configuration,
        metadata: {
          generatedAt: new Date().toISOString(),
          rationale: plan.rationale,
          repositoryInfo: input.repositoryInfo,
          aiModel: "gpt-5"
        }
      });

      // Create audit log
      await storage.createIntegrationAuditLog({
        integrationId: null,
        userId: input.userId,
        action: "created",
        resourceType: "deployment-plan",
        resourceId: deploymentPlan.id,
        details: {
          planName: plan.name,
          provider: plan.provider,
          estimatedMonthlyCost: plan.estimatedCost.monthly
        },
        risk: "low",
        complianceFlags: [],
        metadata: {}
      });

      return deploymentPlan.id;
    } catch (error) {
      console.error("Plan generation failed:", error);
      throw new Error("Failed to generate deployment plan: " + (error as Error).message);
    }
  }

  /**
   * Approve a deployment plan
   */
  async approvePlan(planId: string, userId: string): Promise<void> {
    const plan = await storage.getDeploymentPlan(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    if (plan.status !== "pending") {
      throw new Error(`Plan cannot be approved - current status: ${plan.status}`);
    }

    await storage.updateDeploymentPlan(planId, {
      status: "approved",
      approvedBy: userId,
      approvedAt: new Date()
    });

    // Create audit log
    await storage.createIntegrationAuditLog({
      integrationId: null,
      userId,
      action: "approved",
      resourceType: "deployment-plan",
      resourceId: planId,
      details: {
        planName: plan.name,
        approvedBy: userId
      },
      risk: "medium",
      complianceFlags: ["plan-approved"],
      metadata: {}
    });
  }

  /**
   * Reject a deployment plan
   */
  async rejectPlan(planId: string, userId: string, reason: string): Promise<void> {
    const plan = await storage.getDeploymentPlan(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    await storage.updateDeploymentPlan(planId, {
      status: "rejected",
      rejectedReason: reason
    });

    // Create audit log
    await storage.createIntegrationAuditLog({
      integrationId: null,
      userId,
      action: "rejected",
      resourceType: "deployment-plan",
      resourceId: planId,
      details: {
        planName: plan.name,
        reason
      },
      risk: "low",
      complianceFlags: [],
      metadata: {}
    });
  }

  /**
   * Execute an approved deployment plan
   */
  async executePlan(planId: string): Promise<string> {
    const plan = await storage.getDeploymentPlan(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    if (plan.status !== "approved") {
      throw new Error(`Plan must be approved before execution - current status: ${plan.status}`);
    }

    // Update plan status
    await storage.updateDeploymentPlan(planId, {
      status: "executing"
    });

    // Create deployment record
    const deployment = await storage.createDeployment({
      projectId: plan.projectId,
      version: `v${Date.now()}`,
      strategy: "rolling",
      status: "deploying",
      environment: "production",
      metadata: {
        planId: planId,
        provider: plan.provider,
        region: plan.region,
        resources: plan.resources
      }
    });

    // Link deployment to plan
    await storage.updateDeploymentPlan(planId, {
      deploymentId: deployment.id
    });

    return deployment.id;
  }

  /**
   * Get plan details with cost breakdown
   */
  async getPlanDetails(planId: string) {
    const plan = await storage.getDeploymentPlan(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    return {
      ...plan,
      costBreakdown: this.formatCostBreakdown(plan.estimatedCost),
      resourceSummary: this.summarizeResources(plan.resources)
    };
  }

  /**
   * Format cost breakdown for display
   */
  private formatCostBreakdown(estimatedCost: any) {
    const breakdown = estimatedCost?.breakdown || [];
    const monthly = estimatedCost?.monthly || 0;
    const setup = estimatedCost?.setup || 0;
    const currency = estimatedCost?.currency || 'USD';

    return {
      monthly: {
        amount: monthly,
        currency,
        formatted: `$${monthly.toFixed(2)}/month`
      },
      setup: {
        amount: setup,
        currency,
        formatted: `$${setup.toFixed(2)} one-time`
      },
      firstYearTotal: {
        amount: setup + (monthly * 12),
        currency,
        formatted: `$${(setup + (monthly * 12)).toFixed(2)}/year`
      },
      breakdown: breakdown.map((item: any) => ({
        ...item,
        formatted: `$${(item.cost || 0).toFixed(2)}`
      }))
    };
  }

  /**
   * Summarize resources for display
   */
  private summarizeResources(resources: any[]) {
    const summary: Record<string, number> = {};
    
    resources.forEach(resource => {
      const type = resource.type;
      summary[type] = (summary[type] || 0) + 1;
    });

    return {
      total: resources.length,
      byType: summary,
      list: resources.map(r => ({
        type: r.type,
        name: r.name,
        cost: r.estimatedCost || 0
      }))
    };
  }
}

export const deploymentPlanService = new DeploymentPlanService();
