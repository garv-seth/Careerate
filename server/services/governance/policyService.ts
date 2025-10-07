/**
 * Policy Service
 * Evaluates governance policies including change windows, budgets, environment protections
 */

import { db } from '../../db';
import {
  governancePolicies,
  policyEvaluations,
  budgetLimits,
  systemControls,
  type GovernancePolicy,
  type InsertGovernancePolicy,
  type BudgetLimit,
  type SystemControl,
} from '../../../shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';

export interface PolicyEvaluationContext {
  resourceType: string;
  resourceId: string;
  action: string;
  environment: string;
  provider?: string;
  region?: string;
  estimatedCost?: number;
  requestedBy: string;
  targetTime?: Date;
  metadata?: any;
}

export interface PolicyEvaluationResult {
  passed: boolean;
  enforcement: 'block' | 'warn' | 'audit';
  violations: Array<{
    policyId: string;
    policyName: string;
    type: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  recommendations: string[];
}

class PolicyService {
  /**
   * Evaluate all applicable policies for a context
   */
  async evaluatePolicies(
    context: PolicyEvaluationContext
  ): Promise<PolicyEvaluationResult> {
    // Check global kill switch first
    const killSwitchActive = await this.isKillSwitchActive(context.environment);
    if (killSwitchActive) {
      return {
        passed: false,
        enforcement: 'block',
        violations: [
          {
            policyId: 'kill-switch',
            policyName: 'Global Kill Switch',
            type: 'system-control',
            message: `All write operations are blocked. Global kill switch is active for ${context.environment}.`,
            severity: 'error',
          },
        ],
        recommendations: [
          'Contact an administrator to disable the kill switch.',
        ],
      };
    }

    // Get applicable policies
    const policies = await this.getApplicablePolicies(context);

    const violations: PolicyEvaluationResult['violations'] = [];
    const recommendations: string[] = [];

    // Evaluate each policy
    for (const policy of policies) {
      const evaluation = await this.evaluatePolicy(policy, context);
      
      if (!evaluation.passed) {
        violations.push({
          policyId: policy.id,
          policyName: policy.name,
          type: policy.type,
          message: evaluation.message,
          severity: policy.enforcement === 'block' ? 'error' : 'warning',
        });
      }

      if (evaluation.recommendations) {
        recommendations.push(...evaluation.recommendations);
      }

      // Log the evaluation
      await db.insert(policyEvaluations).values({
        policyId: policy.id,
        evaluatedBy: context.requestedBy,
        evaluationType: 'pre-execution',
        resourceType: context.resourceType,
        resourceId: context.resourceId,
        context: context as any,
        result: evaluation.passed ? 'pass' : 'fail',
        violations: evaluation.passed ? [] : [evaluation.message],
        recommendations: evaluation.recommendations || [],
      });
    }

    // Determine overall enforcement level
    const hasBlockingViolations = violations.some(v => v.severity === 'error');
    const enforcement = hasBlockingViolations ? 'block' : 
                        violations.length > 0 ? 'warn' : 'audit';

    return {
      passed: !hasBlockingViolations,
      enforcement,
      violations,
      recommendations,
    };
  }

  /**
   * Evaluate a single policy
   */
  private async evaluatePolicy(
    policy: GovernancePolicy,
    context: PolicyEvaluationContext
  ): Promise<{
    passed: boolean;
    message: string;
    recommendations?: string[];
  }> {
    const rules = policy.rules as any;

    switch (policy.type) {
      case 'change-window':
        return this.evaluateChangeWindow(rules, context);

      case 'budget-limit':
        return await this.evaluateBudgetLimit(rules, context);

      case 'approval-requirement':
        return this.evaluateApprovalRequirement(rules, context);

      case 'region-allowlist':
        return this.evaluateRegionAllowlist(rules, context);

      case 'environment-protection':
        return this.evaluateEnvironmentProtection(rules, context);

      default:
        return {
          passed: true,
          message: `Unknown policy type: ${policy.type}`,
        };
    }
  }

  /**
   * Evaluate change window policy
   */
  private evaluateChangeWindow(
    rules: any,
    context: PolicyEvaluationContext
  ): {
    passed: boolean;
    message: string;
    recommendations?: string[];
  } {
    const targetTime = context.targetTime || new Date();
    const dayOfWeek = targetTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = targetTime.getHours();

    const allowedDays = rules.allowedDays || [1, 2, 3, 4, 5]; // Mon-Fri
    const allowedStartHour = rules.allowedStartHour || 9; // 9 AM
    const allowedEndHour = rules.allowedEndHour || 17; // 5 PM
    const timezone = rules.timezone || 'UTC';

    const isDayAllowed = allowedDays.includes(dayOfWeek);
    const isHourAllowed = hour >= allowedStartHour && hour < allowedEndHour;

    if (!isDayAllowed || !isHourAllowed) {
      return {
        passed: false,
        message: `Action is outside allowed change window. Allowed: ${allowedDays.join(', ')} (day of week), ${allowedStartHour}:00-${allowedEndHour}:00 ${timezone}. Current: ${dayOfWeek}, ${hour}:00 ${timezone}`,
        recommendations: [
          `Schedule the action within the change window: ${allowedDays.join(', ')} ${allowedStartHour}:00-${allowedEndHour}:00 ${timezone}`,
        ],
      };
    }

    return {
      passed: true,
      message: 'Action is within allowed change window',
    };
  }

  /**
   * Evaluate budget limit policy
   */
  private async evaluateBudgetLimit(
    rules: any,
    context: PolicyEvaluationContext
  ): Promise<{
    passed: boolean;
    message: string;
    recommendations?: string[];
  }> {
    const estimatedCost = context.estimatedCost || 0;
    
    // Get applicable budget limits
    const budgets = await this.getApplicableBudgets(context);

    for (const budget of budgets) {
      const currentSpend = parseFloat(budget.currentSpend as any) || 0;
      const limitAmount = parseFloat(budget.limitAmount as any);
      const threshold = budget.threshold || 80;

      const projectedSpend = currentSpend + estimatedCost;
      const percentageUsed = (projectedSpend / limitAmount) * 100;

      if (projectedSpend > limitAmount && budget.enforcement === 'block') {
        return {
          passed: false,
          message: `Budget exceeded. Limit: $${limitAmount}, Current: $${currentSpend}, Estimated cost: $${estimatedCost}, Projected: $${projectedSpend}`,
          recommendations: [
            'Increase the budget limit',
            'Reduce the scope of the action to lower costs',
            'Request a budget exception from an administrator',
          ],
        };
      }

      if (percentageUsed >= threshold) {
        return {
          passed: budget.enforcement !== 'block',
          message: `Budget threshold ${threshold}% exceeded. Current usage: ${percentageUsed.toFixed(1)}%`,
          recommendations: [
            'Monitor budget closely',
            'Consider cost optimization',
          ],
        };
      }
    }

    return {
      passed: true,
      message: 'Budget check passed',
    };
  }

  /**
   * Evaluate approval requirement policy
   */
  private evaluateApprovalRequirement(
    rules: any,
    context: PolicyEvaluationContext
  ): {
    passed: boolean;
    message: string;
    recommendations?: string[];
  } {
    const requiredApprovers = rules.requiredApprovers || 1;
    const approverRoles = rules.approverRoles || ['approver', 'admin'];

    return {
      passed: true, // This is just metadata, actual approval happens in approval service
      message: `This action requires ${requiredApprovers} approval(s) from: ${approverRoles.join(', ')}`,
      recommendations: [
        `Ensure approval request includes ${requiredApprovers} approvers with roles: ${approverRoles.join(', ')}`,
      ],
    };
  }

  /**
   * Evaluate region allowlist policy
   */
  private evaluateRegionAllowlist(
    rules: any,
    context: PolicyEvaluationContext
  ): {
    passed: boolean;
    message: string;
    recommendations?: string[];
  } {
    const allowedRegions = rules.allowedRegions || [];
    const targetRegion = context.region;

    if (!targetRegion) {
      return {
        passed: true,
        message: 'No region specified, cannot evaluate region allowlist',
      };
    }

    if (allowedRegions.length > 0 && !allowedRegions.includes(targetRegion)) {
      return {
        passed: false,
        message: `Region ${targetRegion} is not in the allowlist. Allowed regions: ${allowedRegions.join(', ')}`,
        recommendations: [
          `Use one of the allowed regions: ${allowedRegions.join(', ')}`,
          'Request an exception if this region is critical',
        ],
      };
    }

    return {
      passed: true,
      message: 'Region is allowed',
    };
  }

  /**
   * Evaluate environment protection policy
   */
  private evaluateEnvironmentProtection(
    rules: any,
    context: PolicyEvaluationContext
  ): {
    passed: boolean;
    message: string;
    recommendations?: string[];
  } {
    const protectedEnvironments = rules.protectedEnvironments || ['production'];
    const requiresApproval = rules.requiresApproval !== false;
    const allowedActions = rules.allowedActions || [];

    if (protectedEnvironments.includes(context.environment)) {
      if (allowedActions.length > 0 && !allowedActions.includes(context.action)) {
        return {
          passed: false,
          message: `Action ${context.action} is not allowed in ${context.environment}. Allowed actions: ${allowedActions.join(', ')}`,
          recommendations: [
            'Use an allowed action type',
            'Test in a non-production environment first',
          ],
        };
      }

      if (requiresApproval) {
        return {
          passed: true, // Approval is handled separately
          message: `Action in protected environment ${context.environment} requires approval`,
          recommendations: [
            'Ensure approval workflow is followed',
          ],
        };
      }
    }

    return {
      passed: true,
      message: 'Environment protection check passed',
    };
  }

  /**
   * Get applicable policies for a context
   */
  private async getApplicablePolicies(
    context: PolicyEvaluationContext
  ): Promise<GovernancePolicy[]> {
    const allPolicies = await db
      .select()
      .from(governancePolicies)
      .where(eq(governancePolicies.isActive, true));

    // Filter by scope
    return allPolicies.filter(policy => {
      if (policy.scope === 'global') {
        return true;
      }

      if (policy.scope === `environment:${context.environment}`) {
        return true;
      }

      if (policy.scope === `provider:${context.provider}`) {
        return true;
      }

      return false;
    });
  }

  /**
   * Get applicable budget limits for a context
   */
  private async getApplicableBudgets(
    context: PolicyEvaluationContext
  ): Promise<BudgetLimit[]> {
    const allBudgets = await db
      .select()
      .from(budgetLimits)
      .where(eq(budgetLimits.isActive, true));

    return allBudgets.filter(budget => {
      if (budget.scope === 'global') {
        return true;
      }

      if (budget.scope === `environment:${context.environment}`) {
        return true;
      }

      if (budget.scope === `runbook:${context.action}`) {
        return true;
      }

      return false;
    });
  }

  /**
   * Check if kill switch is active
   */
  async isKillSwitchActive(environment?: string): Promise<boolean> {
    const [control] = await db
      .select()
      .from(systemControls)
      .where(eq(systemControls.controlType, 'global-kill-switch'));

    if (!control) {
      return false;
    }

    if (!control.isEnabled) {
      return true; // Kill switch is ON (isEnabled = false means operations are disabled)
    }

    // Check if specific environment is affected
    if (environment) {
      const affectedScopes = (control.affectedScopes as string[]) || [];
      return affectedScopes.includes(environment) || affectedScopes.includes('all');
    }

    return false;
  }

  /**
   * Toggle kill switch
   */
  async toggleKillSwitch(
    userId: string,
    enabled: boolean,
    reason: string,
    affectedScopes?: string[]
  ): Promise<SystemControl> {
    const [existing] = await db
      .select()
      .from(systemControls)
      .where(eq(systemControls.controlType, 'global-kill-switch'));

    if (existing) {
      const [updated] = await db
        .update(systemControls)
        .set({
          isEnabled: enabled,
          affectedScopes: affectedScopes || existing.affectedScopes,
          reason,
          enabledBy: enabled ? userId : existing.enabledBy,
          disabledBy: !enabled ? userId : existing.disabledBy,
          enabledAt: enabled ? new Date() : existing.enabledAt,
          disabledAt: !enabled ? new Date() : existing.disabledAt,
          updatedAt: new Date(),
        })
        .where(eq(systemControls.id, existing.id))
        .returning();

      return updated;
    } else {
      const [created] = await db
        .insert(systemControls)
        .values({
          controlType: 'global-kill-switch',
          isEnabled: enabled,
          affectedScopes: affectedScopes || ['all'],
          reason,
          enabledBy: enabled ? userId : null,
          disabledBy: !enabled ? userId : null,
          enabledAt: enabled ? new Date() : null,
          disabledAt: !enabled ? new Date() : null,
        })
        .returning();

      return created;
    }
  }

  /**
   * Create a governance policy
   */
  async createPolicy(policyData: InsertGovernancePolicy): Promise<GovernancePolicy> {
    const [policy] = await db
      .insert(governancePolicies)
      .values(policyData)
      .returning();

    return policy;
  }

  /**
   * Update budget spend
   */
  async updateBudgetSpend(budgetId: string, amount: number): Promise<void> {
    const [budget] = await db
      .select()
      .from(budgetLimits)
      .where(eq(budgetLimits.id, budgetId));

    if (budget) {
      const currentSpend = parseFloat(budget.currentSpend as any) || 0;
      const newSpend = currentSpend + amount;

      await db
        .update(budgetLimits)
        .set({
          currentSpend: newSpend.toString() as any,
          updatedAt: new Date(),
        })
        .where(eq(budgetLimits.id, budgetId));
    }
  }

  /**
   * Reset budget limits based on reset period
   */
  async resetBudgetsIfNeeded(): Promise<void> {
    const now = new Date();
    const budgets = await db
      .select()
      .from(budgetLimits)
      .where(eq(budgetLimits.isActive, true));

    for (const budget of budgets) {
      const lastReset = budget.lastReset;
      const resetPeriod = budget.resetPeriod;

      let shouldReset = false;

      if (resetPeriod === 'daily' && lastReset) {
        const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
        shouldReset = daysSinceReset >= 1;
      } else if (resetPeriod === 'weekly' && lastReset) {
        const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
        shouldReset = daysSinceReset >= 7;
      } else if (resetPeriod === 'monthly' && lastReset) {
        shouldReset = now.getMonth() !== lastReset.getMonth() || 
                      now.getFullYear() !== lastReset.getFullYear();
      }

      if (shouldReset) {
        await db
          .update(budgetLimits)
          .set({
            currentSpend: sql`0`,
            lastReset: now,
            updatedAt: now,
          })
          .where(eq(budgetLimits.id, budget.id));
      }
    }
  }
}

export const policyService = new PolicyService();

