export interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
}

export interface CloudResource {
  id: string;
  type: string;
  status: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface AnalysisResult {
  technology: string;
  recommendedInfrastructure: {
    estimatedCost: number;
  };
}

export interface DeploymentPlan {
  planId: string;
}

export interface OptimizationResult {
  totalEstimatedSavings: number;
} 