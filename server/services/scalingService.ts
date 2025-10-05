/**
 * INTELLIGENT SCALING SERVICE
 * AI-powered autoscaling with predictive analytics
 */

import { storage } from "../storage";
import type { ScalingPolicy, Deployment } from "@shared/schema";

interface ScalingMetrics {
  cpu: number;
  memory: number;
  requestsPerSecond: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'no_change';
  currentReplicas: number;
  targetReplicas: number;
  reason: string;
  confidence: number;
}

export class ScalingService {
  private metricsHistory: Map<string, ScalingMetrics[]> = new Map();
  private lastScaleAction: Map<string, number> = new Map();

  /**
   * Evaluate scaling policies for a deployment
   */
  async evaluateScaling(deploymentId: string, currentMetrics: ScalingMetrics): Promise<ScalingDecision> {
    const policies = await storage.getDeploymentScalingPolicies(deploymentId);
    
    if (policies.length === 0) {
      return {
        action: 'no_change',
        currentReplicas: 1,
        targetReplicas: 1,
        reason: 'No scaling policies configured',
        confidence: 1.0
      };
    }

    // Store metrics history for predictive analysis
    this.storeMetrics(deploymentId, currentMetrics);

    // Get active policy (for now, use the first active policy)
    const policy = policies.find(p => p.isActive);
    if (!policy) {
      return {
        action: 'no_change',
        currentReplicas: 1,
        targetReplicas: 1,
        reason: 'No active scaling policies',
        confidence: 1.0
      };
    }

    // Check cooldown
    const lastScale = this.lastScaleAction.get(deploymentId) || 0;
    const cooldownMs = (policy.cooldownSeconds || 300) * 1000;
    if (Date.now() - lastScale < cooldownMs) {
      return {
        action: 'no_change',
        currentReplicas: 1,
        targetReplicas: 1,
        reason: 'Cooldown period active',
        confidence: 1.0
      };
    }

    // Evaluate metrics against policy
    const decision = await this.makeScalingDecision(policy, currentMetrics, deploymentId);

    // Apply decision
    if (decision.action !== 'no_change') {
      await this.executeScaling(deploymentId, policy, decision);
    }

    return decision;
  }

  /**
   * Make scaling decision based on policy and metrics
   */
  private async makeScalingDecision(
    policy: ScalingPolicy,
    metrics: ScalingMetrics,
    deploymentId: string
  ): Promise<ScalingDecision> {
    const metricValue = this.getMetricValue(metrics, policy.metricType);
    const deployment = await storage.getDeployment(deploymentId);
    
    // Get current replica count from deployment metadata
    const currentReplicas = (deployment?.metadata as any)?.replicas || 1;
    const minReplicas = policy.minReplicas || 1;
    const maxReplicas = policy.maxReplicas || 10;

    // Use predictive model to forecast load
    const predictedLoad = this.predictLoad(deploymentId, policy.metricType);
    const effectiveThreshold = this.adjustThresholdWithPrediction(
      metricValue,
      predictedLoad,
      policy.scaleUpThreshold
    );

    // Scale up logic
    if (metricValue > policy.scaleUpThreshold || predictedLoad > policy.scaleUpThreshold) {
      const targetReplicas = Math.min(
        currentReplicas + this.calculateScaleAmount(metricValue, policy.scaleUpThreshold),
        maxReplicas
      );

      if (targetReplicas > currentReplicas) {
        return {
          action: 'scale_up',
          currentReplicas,
          targetReplicas,
          reason: `${policy.metricType} (${metricValue}) exceeds threshold (${policy.scaleUpThreshold})${predictedLoad > policy.scaleUpThreshold ? ' with predicted spike' : ''}`,
          confidence: this.calculateConfidence(metricValue, policy.scaleUpThreshold, predictedLoad)
        };
      }
    }

    // Scale down logic
    if (metricValue < policy.scaleDownThreshold && currentReplicas > minReplicas) {
      // Only scale down if metrics have been low for sustained period
      const sustainedLow = this.isSustainedLowLoad(deploymentId, policy.metricType, policy.scaleDownThreshold);
      
      if (sustainedLow) {
        const targetReplicas = Math.max(
          currentReplicas - 1,
          minReplicas
        );

        return {
          action: 'scale_down',
          currentReplicas,
          targetReplicas,
          reason: `${policy.metricType} (${metricValue}) below threshold (${policy.scaleDownThreshold}) for sustained period`,
          confidence: 0.9
        };
      }
    }

    return {
      action: 'no_change',
      currentReplicas,
      targetReplicas: currentReplicas,
      reason: `Metrics within acceptable range`,
      confidence: 1.0
    };
  }

  /**
   * Execute scaling action
   */
  private async executeScaling(
    deploymentId: string,
    policy: ScalingPolicy,
    decision: ScalingDecision
  ): Promise<void> {
    console.log(`🔄 Scaling ${decision.action} for deployment ${deploymentId}:`, {
      from: decision.currentReplicas,
      to: decision.targetReplicas,
      reason: decision.reason
    });

    // Update policy last scaled timestamp
    await storage.updateScalingPolicy(policy.id, {
      lastScaled: new Date()
    });

    // Record scaling action
    this.lastScaleAction.set(deploymentId, Date.now());

    // Update deployment replica count
    const deployment = await storage.getDeployment(deploymentId);
    if (deployment) {
      await storage.updateDeployment(deploymentId, {
        metadata: {
          ...(deployment.metadata as any || {}),
          replicas: decision.targetReplicas,
          lastScalingAction: {
            timestamp: new Date().toISOString(),
            action: decision.action,
            reason: decision.reason,
            confidence: decision.confidence
          }
        }
      });
    }

    // TODO: Call cloud provider API to actually scale
    // await this.scaleCloudResource(deploymentId, decision.targetReplicas);

    // Create audit log
    await storage.createIntegrationAuditLog({
      integrationId: null,
      userId: null,
      action: 'scaled',
      resourceType: 'deployment',
      resourceId: deploymentId,
      details: {
        action: decision.action,
        from: decision.currentReplicas,
        to: decision.targetReplicas,
        reason: decision.reason,
        policyId: policy.id
      },
      risk: 'medium',
      complianceFlags: ['auto-scaling'],
      metadata: {}
    });
  }

  /**
   * Get metric value from metrics object
   */
  private getMetricValue(metrics: ScalingMetrics, metricType: string): number {
    switch (metricType) {
      case 'cpu': return metrics.cpu;
      case 'memory': return metrics.memory;
      case 'requests': return metrics.requestsPerSecond;
      case 'response_time': return metrics.responseTime;
      case 'error_rate': return metrics.errorRate;
      case 'connections': return metrics.activeConnections;
      default: return 0;
    }
  }

  /**
   * Store metrics for historical analysis
   */
  private storeMetrics(deploymentId: string, metrics: ScalingMetrics): void {
    const history = this.metricsHistory.get(deploymentId) || [];
    history.push(metrics);
    
    // Keep last 100 metrics (about 100 minutes at 1min intervals)
    if (history.length > 100) {
      history.shift();
    }
    
    this.metricsHistory.set(deploymentId, history);
  }

  /**
   * Predict future load using simple time-series analysis
   */
  private predictLoad(deploymentId: string, metricType: string): number {
    const history = this.metricsHistory.get(deploymentId) || [];
    
    if (history.length < 5) {
      return 0; // Not enough data
    }

    // Get last 10 data points
    const recentMetrics = history.slice(-10).map(m => this.getMetricValue(m, metricType));
    
    // Calculate trend using simple linear regression
    const n = recentMetrics.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = recentMetrics.reduce((a, b) => a + b, 0);
    const sumXY = recentMetrics.reduce((sum, y, i) => sum + ((i + 1) * y), 0);
    const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next value
    const predicted = slope * (n + 1) + intercept;

    return Math.max(0, predicted);
  }

  /**
   * Adjust threshold based on predicted load
   */
  private adjustThresholdWithPrediction(
    current: number,
    predicted: number,
    threshold: number
  ): number {
    // If predicted load is increasing rapidly, lower threshold
    const changeRate = predicted > current ? (predicted - current) / current : 0;
    
    if (changeRate > 0.2) { // 20% increase predicted
      return threshold * 0.8; // Lower threshold by 20% for proactive scaling
    }
    
    return threshold;
  }

  /**
   * Check if load has been low for sustained period
   */
  private isSustainedLowLoad(deploymentId: string, metricType: string, threshold: number): boolean {
    const history = this.metricsHistory.get(deploymentId) || [];
    
    if (history.length < 5) {
      return false; // Need sustained period
    }

    // Check last 5 data points
    const recent = history.slice(-5);
    return recent.every(m => this.getMetricValue(m, metricType) < threshold);
  }

  /**
   * Calculate how many replicas to add based on metric value
   */
  private calculateScaleAmount(value: number, threshold: number): number {
    const ratio = value / threshold;
    
    if (ratio > 2) return 3; // Double threshold = add 3
    if (ratio > 1.5) return 2; // 50% over = add 2
    return 1; // Otherwise add 1
  }

  /**
   * Calculate confidence score for scaling decision
   */
  private calculateConfidence(current: number, threshold: number, predicted: number): number {
    const currentExcess = Math.max(0, (current - threshold) / threshold);
    const predictedExcess = Math.max(0, (predicted - threshold) / threshold);
    
    // Higher confidence if both current and predicted exceed threshold
    if (currentExcess > 0 && predictedExcess > 0) {
      return Math.min(0.95, 0.7 + (currentExcess + predictedExcess) * 0.1);
    }
    
    // Medium confidence if only one exceeds
    if (currentExcess > 0 || predictedExcess > 0) {
      return 0.75;
    }
    
    return 0.5;
  }
}

export const scalingService = new ScalingService();
