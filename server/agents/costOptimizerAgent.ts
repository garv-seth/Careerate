/**
 * Cost Optimizer Agent
 * 
 * Analyzes cloud spending and recommends cost optimizations
 * Tracks budgets, detects anomalies, and triggers alerts
 */

import { BaseAgent, AgentContext, AgentActionBuilder } from './baseAgent';
import { selectModelForTask } from './kernel.config';
import { storageV2 } from '../storage-v2';

export interface CostAnalysis {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  totalCost: number; // in cents
  breakdown: {
    compute: number;
    database: number;
    storage: number;
    bandwidth: number;
    other: number;
  };
  trends: {
    change: number; // percentage
    direction: 'up' | 'down' | 'stable';
  };
  projectedMonthlyCost: number;
  budgetStatus: 'under' | 'near' | 'over';
}

export interface OptimizationRecommendation {
  id: string;
  type: 'instance-sizing' | 'reserved-capacity' | 'storage-tier' | 'auto-scaling' | 'spot-instances';
  title: string;
  description: string;
  estimatedSavings: number; // in cents per month
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
}

export interface BudgetAlert {
  userId: string;
  threshold: number; // in cents
  currentSpend: number; // in cents
  percentageUsed: number;
  timeRemaining: string;
  severity: 'info' | 'warning' | 'critical';
}

/**
 * Cost Optimizer Agent
 * 
 * Intelligent cost analysis and optimization
 */
export class CostOptimizerAgent extends BaseAgent {
  constructor() {
    super('cost-optimizer', selectModelForTask('cost-optimization'));
  }

  getName(): string {
    return 'Cost Optimizer Agent';
  }

  /**
   * Analyze user's cloud spending
   */
  async analyzeCosts(
    userId: string,
    context: AgentContext,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<CostAnalysis> {
    const action = new AgentActionBuilder()
      .type('analyze-costs')
      .description('Analyze cloud spending and trends')
      .reasoning('User requested cost analysis')
      .risk('low')
      .cost(10) // $0.10 for analysis
      .build();

    const result = await this.executeAction(action, context, async () => {
      return await this.performCostAnalysis(userId, period);
    });

    if (!result.success) {
      throw new Error(result.error || 'Cost analysis failed');
    }

    return result.data;
  }

  /**
   * Perform cost analysis
   */
  private async performCostAnalysis(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<CostAnalysis> {
    // Get user's autonomy settings for budget
    const autonomySettings = await storageV2.getUserAutonomySettings(userId);
    const budget = autonomySettings?.costLimit || 0;

    // In production, would query actual cloud provider billing APIs
    // For now, generate realistic mock data
    const totalCost = this.generateMockCost(period);

    const breakdown = {
      compute: Math.floor(totalCost * 0.5),
      database: Math.floor(totalCost * 0.25),
      storage: Math.floor(totalCost * 0.1),
      bandwidth: Math.floor(totalCost * 0.1),
      other: Math.floor(totalCost * 0.05)
    };

    // Calculate trend (comparing to previous period)
    const previousCost = totalCost * (0.8 + Math.random() * 0.4); // 80-120% of current
    const change = ((totalCost - previousCost) / previousCost) * 100;

    // Project monthly cost
    const projectedMonthlyCost = period === 'monthly' 
      ? totalCost 
      : period === 'weekly' 
        ? totalCost * 4.33 
        : totalCost * 30;

    // Check budget status
    let budgetStatus: 'under' | 'near' | 'over' = 'under';
    if (budget > 0) {
      const percentageUsed = (projectedMonthlyCost / budget) * 100;
      if (percentageUsed >= 100) budgetStatus = 'over';
      else if (percentageUsed >= 80) budgetStatus = 'near';
    }

    return {
      userId,
      period,
      totalCost,
      breakdown,
      trends: {
        change,
        direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
      },
      projectedMonthlyCost,
      budgetStatus
    };
  }

  /**
   * Generate mock cost data
   */
  private generateMockCost(period: 'daily' | 'weekly' | 'monthly'): number {
    const baseMonthlyCost = 15000; // $150/month base
    
    switch (period) {
      case 'daily':
        return Math.floor(baseMonthlyCost / 30 * (0.8 + Math.random() * 0.4));
      case 'weekly':
        return Math.floor(baseMonthlyCost / 4.33 * (0.8 + Math.random() * 0.4));
      case 'monthly':
        return Math.floor(baseMonthlyCost * (0.8 + Math.random() * 0.4));
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(
    userId: string,
    context: AgentContext
  ): Promise<OptimizationRecommendation[]> {
    const action = new AgentActionBuilder()
      .type('get-optimization-recommendations')
      .description('Generate cost optimization recommendations')
      .reasoning('User wants to reduce cloud spending')
      .risk('low')
      .cost(20) // $0.20 for AI analysis
      .build();

    const result = await this.executeAction(action, context, async () => {
      return await this.generateRecommendations(userId);
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate recommendations');
    }

    return result.data;
  }

  /**
   * Generate cost optimization recommendations
   */
  private async generateRecommendations(userId: string): Promise<OptimizationRecommendation[]> {
    // In production, would use AI to analyze actual usage patterns
    // For now, return realistic recommendations
    return [
      {
        id: 'rec_1',
        type: 'instance-sizing',
        title: 'Rightsize compute instances',
        description: 'Switch from t3.large to t3.medium instances. CPU usage averages only 25%, indicating over-provisioning.',
        estimatedSavings: 4200, // $42/month
        effort: 'low',
        priority: 'high',
        autoApplicable: true
      },
      {
        id: 'rec_2',
        type: 'storage-tier',
        title: 'Move infrequent data to cold storage',
        description: 'S3 bucket has 45GB of data not accessed in 90+ days. Move to S3 Glacier for 75% savings.',
        estimatedSavings: 1500, // $15/month
        effort: 'low',
        priority: 'medium',
        autoApplicable: false
      },
      {
        id: 'rec_3',
        type: 'reserved-capacity',
        title: 'Purchase reserved instances',
        description: 'Your usage is consistent. Commit to 1-year reserved instances for 40% discount.',
        estimatedSavings: 6000, // $60/month
        effort: 'low',
        priority: 'high',
        autoApplicable: false
      },
      {
        id: 'rec_4',
        type: 'auto-scaling',
        title: 'Enable aggressive auto-scaling',
        description: 'Traffic drops 60% during off-hours. Scale down to 1 instance at night.',
        estimatedSavings: 3000, // $30/month
        effort: 'medium',
        priority: 'medium',
        autoApplicable: true
      },
      {
        id: 'rec_5',
        type: 'spot-instances',
        title: 'Use spot instances for batch jobs',
        description: 'Non-critical batch processing can run on spot instances for 70% savings.',
        estimatedSavings: 2100, // $21/month
        effort: 'high',
        priority: 'low',
        autoApplicable: false
      }
    ];
  }

  /**
   * Apply optimization automatically
   */
  async applyOptimization(
    recommendationId: string,
    context: AgentContext
  ): Promise<{ success: boolean; message: string }> {
    const action = new AgentActionBuilder()
      .type('apply-optimization')
      .description('Apply cost optimization')
      .reasoning('User approved cost optimization')
      .risk('medium')
      .cost(0) // Optimization reduces cost
      .canRollback(true)
      .build();

    const result = await this.executeAction(action, context, async () => {
      // In production, would apply actual optimization
      await this.sleep(2000);

      return {
        success: true,
        message: 'Optimization applied successfully'
      };
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to apply optimization');
    }

    return result.data;
  }

  /**
   * Check budget and create alert if needed
   */
  async checkBudget(userId: string): Promise<BudgetAlert | null> {
    // Get user's autonomy settings
    const autonomySettings = await storageV2.getUserAutonomySettings(userId);
    if (!autonomySettings?.costLimit) {
      return null; // No budget set
    }

    // Get current spending
    const analysis = await this.performCostAnalysis(userId, 'monthly');

    const percentageUsed = (analysis.projectedMonthlyCost / autonomySettings.costLimit) * 100;

    // Only create alert if over 80%
    if (percentageUsed < 80) {
      return null;
    }

    // Calculate time remaining in month
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Create alert
    const alert: BudgetAlert = {
      userId,
      threshold: autonomySettings.costLimit,
      currentSpend: analysis.projectedMonthlyCost,
      percentageUsed,
      timeRemaining: `${daysRemaining} days`,
      severity: percentageUsed >= 100 ? 'critical' : percentageUsed >= 90 ? 'warning' : 'info'
    };

    // Store alert in database
    await storageV2.createCostAlert({
      userId,
      provider: 'multi-cloud',
      alertType: 'threshold',
      threshold: autonomySettings.costLimit,
      currentSpend: analysis.projectedMonthlyCost,
      percentageOfThreshold: percentageUsed
    });

    return alert;
  }

  /**
   * Helper: Sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

