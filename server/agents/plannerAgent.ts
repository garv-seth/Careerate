/**
 * Planner Agent - REAL GPT-5 via Direct OpenAI API
 *
 * Uses: gpt-5 model with reasoning_effort parameter
 * Cost: $1.25/M input, $10/M output
 *
 * Responsibilities:
 * - Analyze user's natural language deployment request
 * - Detect tech stack
 * - Create deployment plan
 * - Estimate costs
 */

import OpenAI from 'openai';

export interface DeploymentPlan {
  appName: string;
  techStack: string;
  infrastructure: {
    compute: string;
    database?: string;
    storage?: string;
  };
  region: string;
  dockerImage?: string;
  port?: number;
  cpu?: number;
  memory?: string;
  costEstimate: {
    monthly: number;
    breakdown: {
      compute: number;
      database?: number;
      storage?: number;
    };
  };
  reasoning: string;
}

export class PlannerAgent {
  private client: OpenAI;

  constructor() {
    // Direct OpenAI API (NOT Azure)
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
  }

  /**
   * Analyze user intent with GPT-5
   */
  async analyze(input: string, context?: {
    repoUrl?: string;
    framework?: string;
  }): Promise<DeploymentPlan> {
    const systemPrompt = `You are an expert DevOps deployment planner for Careerate platform.

Analyze the user's deployment request and create a detailed deployment plan.

Available cloud providers:
- Azure (primary): Container Apps, Functions, PostgreSQL, Blob Storage
- AWS: ECS, Lambda, RDS, S3
- GCP: Cloud Run, Functions, Cloud SQL, Storage

Your response MUST be valid JSON with this exact structure:
{
  "appName": "auto-generated-name-in-kebab-case",
  "techStack": "Next.js | React | Node.js | Python | Go | etc",
  "infrastructure": {
    "compute": "Azure Container Apps | AWS ECS | GCP Cloud Run",
    "database": "PostgreSQL | MongoDB | MySQL | Redis | none",
    "storage": "Blob Storage | S3 | GCS | none"
  },
  "region": "westus2 | us-east-1 | us-central1",
  "dockerImage": "nginx:latest",
  "port": 3000,
  "cpu": 0.5,
  "memory": "1Gi",
  "costEstimate": {
    "monthly": 50,
    "breakdown": {
      "compute": 30,
      "database": 15,
      "storage": 5
    }
  },
  "reasoning": "Why this architecture is optimal for this application"
}

Be specific and practical. Default to Azure Container Apps unless user specifies otherwise.`;

    const userMessage = context?.repoUrl
      ? `${input}\n\nRepository: ${context.repoUrl}\nFramework: ${context.framework || 'detect from repo'}`
      : input;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',  // Use latest available model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content || '{}';
      const plan = JSON.parse(content) as DeploymentPlan;

      // Validate required fields
      if (!plan.appName || !plan.infrastructure || !plan.costEstimate) {
        throw new Error('AI generated invalid plan structure');
      }

      console.log('[PlannerAgent] ✅ Plan created:', plan.appName);
      return plan;

    } catch (error) {
      console.error('[PlannerAgent] ❌ Failed:', error);
      throw new Error(`Planning failed: ${error.message}`);
    }
  }
}
