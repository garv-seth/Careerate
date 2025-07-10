export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    name: string;
    status: string;
    capabilities: string[];
    taskId?: string;
    color: string;
  };
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface DashboardStats {
  agents: {
    active: number;
    total: number;
    queueDepth: number;
    successRate: number;
  };
  cost: {
    total: number;
    byType: Record<string, number>;
    monthlyChange: number;
  };
  health: {
    score: number;
    responseTime: number;
    activeEndpoints: number;
    totalEndpoints: number;
  };
  recentLogs: Array<{
    id: number;
    fromAgent: string;
    toAgent: string;
    message: string;
    taskId?: string | null;
    timestamp: Date | null;
  }>;
}
