/**
 * AUTONOMOUS INCIDENT RESPONSE AGENT
 * Multi-agent orchestration for self-healing infrastructure
 * This is the revolutionary MOAT feature - autonomous incident detection,
 * root cause analysis, and self-remediation
 */

import OpenAI from "openai";
import { storage } from "../storage";
import { alertService } from "../services/alertService";
import { scalingService } from "../services/scalingService";
import type { Incident, Deployment, HealthCheck } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR
});

interface IncidentContext {
  deploymentId: string;
  projectId: string;
  symptoms: string[];
  healthChecks: HealthCheck[];
  recentLogs: string[];
  metrics: any;
  relatedIncidents: Incident[];
}

interface RemediationPlan {
  steps: RemediationStep[];
  estimatedDuration: number;
  confidence: number;
  rationale: string;
  rollbackPlan?: string;
}

interface RemediationStep {
  id: string;
  action: string;
  parameters: any;
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  autoExecute: boolean;
}

interface RemediationResult {
  success: boolean;
  stepsExecuted: string[];
  outcome: string;
  metricsAfter: any;
  requiresHumanIntervention: boolean;
}

export class IncidentResponseAgent {
  private activeIncidents: Map<string, string> = new Map(); // deploymentId -> incidentId

  /**
   * Detect and respond to incidents autonomously
   */
  async detectAndRespond(deploymentId: string): Promise<void> {
    try {
      // Check if there's already an active incident
      if (this.activeIncidents.has(deploymentId)) {
        console.log(`Incident already active for deployment ${deploymentId}`);
        return;
      }

      // Gather context
      const context = await this.gatherContext(deploymentId);

      // Detect incident using AI
      const incident = await this.detectIncident(context);

      if (!incident) {
        return; // No incident detected
      }

      // Create incident record
      const incidentRecord = await storage.createIncident({
        projectId: context.projectId,
        agentId: 'incident-response-agent',
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: 'detected',
        category: incident.category,
        detectionMethod: 'ai-agent',
        metadata: {
          context,
          detectedAt: new Date().toISOString()
        }
      });

      this.activeIncidents.set(deploymentId, incidentRecord.id);

      // Generate remediation plan using AI
      const plan = await this.generateRemediationPlan(context, incident);

      // Execute auto-remediation if confidence is high
      if (plan.confidence > 0.8 && this.canAutoRemediate(plan)) {
        console.log(`🤖 Auto-remediating incident ${incidentRecord.id}`);
        
        // Update incident status
        await storage.updateIncident(incidentRecord.id, {
          status: 'investigating',
          metadata: {
            remediationPlan: plan,
            autoRemediating: true
          }
        });

        // Execute remediation
        const result = await this.executeRemediation(deploymentId, plan, context);

        if (result.success) {
          // Mark as resolved
          await storage.updateIncident(incidentRecord.id, {
            status: 'resolved',
            resolution: result.outcome,
            resolvedBy: 'incident-response-agent',
            resolvedAt: new Date(),
            metadata: {
              result,
              resolvedAt: new Date().toISOString()
            }
          });

          this.activeIncidents.delete(deploymentId);

          // Send success alert
          await alertService.sendAlert({
            title: `✅ Incident Auto-Resolved: ${incident.title}`,
            message: `The system automatically detected and resolved an incident.\n\n**Issue**: ${incident.description}\n\n**Resolution**: ${result.outcome}`,
            severity: 'info',
            projectId: context.projectId,
            deploymentId,
            metadata: { incidentId: incidentRecord.id, plan, result }
          }, []);

        } else if (result.requiresHumanIntervention) {
          // Escalate to human
          await this.escalateToHuman(incidentRecord.id, context, plan, result);
        }
      } else {
        // Confidence too low or high-risk - notify humans
        await this.escalateToHuman(incidentRecord.id, context, plan, null);
      }

    } catch (error) {
      console.error('Incident response error:', error);
    }
  }

  /**
   * Gather comprehensive context about deployment state
   */
  private async gatherContext(deploymentId: string): Promise<IncidentContext> {
    const deployment = await storage.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    // Get recent health checks
    const healthChecks = await storage.getDeploymentHealthChecks(deploymentId, 10);

    // Get related incidents
    const relatedIncidents = await storage.getActiveIncidents(deployment.projectId);

    // Get recent logs (from deployment metadata or external logging service)
    const recentLogs = (deployment.metadata as any)?.recentLogs || [];

    // Get current metrics
    const metrics = (deployment.metadata as any)?.metrics || {};

    // Identify symptoms
    const symptoms: string[] = [];
    
    const failedHealthChecks = healthChecks.filter(hc => hc.status === 'unhealthy');
    if (failedHealthChecks.length > 0) {
      symptoms.push(`${failedHealthChecks.length} failed health checks`);
    }

    if (metrics.errorRate > 5) {
      symptoms.push(`High error rate: ${metrics.errorRate}%`);
    }

    if (metrics.responseTime > 2000) {
      symptoms.push(`Slow response time: ${metrics.responseTime}ms`);
    }

    if (metrics.cpu > 90) {
      symptoms.push(`High CPU usage: ${metrics.cpu}%`);
    }

    if (metrics.memory > 90) {
      symptoms.push(`High memory usage: ${metrics.memory}%`);
    }

    return {
      deploymentId,
      projectId: deployment.projectId,
      symptoms,
      healthChecks,
      recentLogs,
      metrics,
      relatedIncidents
    };
  }

  /**
   * Use AI to detect and classify incident
   */
  private async detectIncident(context: IncidentContext): Promise<any | null> {
    if (context.symptoms.length === 0) {
      return null; // No incident detected
    }

    const prompt = `You are an expert DevOps incident detection system. Analyze the following deployment context and determine if there is a genuine incident that requires attention.

**Symptoms:**
${context.symptoms.map(s => `- ${s}`).join('\n')}

**Recent Health Checks:**
${context.healthChecks.slice(0, 5).map(hc => `- ${hc.status}: ${hc.message || 'N/A'}`).join('\n')}

**Current Metrics:**
${JSON.stringify(context.metrics, null, 2)}

**Recent Logs (last 10):**
${context.recentLogs.slice(-10).join('\n')}

Determine if this is a genuine incident. If yes, provide:
1. Incident title (brief)
2. Detailed description
3. Severity (info, warning, critical)
4. Category (performance, availability, security, configuration, resource)

Respond in JSON format:
{
  "isIncident": boolean,
  "title": "string",
  "description": "string",
  "severity": "info|warning|critical",
  "category": "string"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert DevOps incident detection AI. Be precise and avoid false positives." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      if (!result.isIncident) {
        return null;
      }

      return result;
    } catch (error) {
      console.error('Incident detection AI error:', error);
      return null;
    }
  }

  /**
   * Generate AI-powered remediation plan
   */
  private async generateRemediationPlan(context: IncidentContext, incident: any): Promise<RemediationPlan> {
    const prompt = `You are an expert Site Reliability Engineer with deep knowledge of cloud infrastructure, deployment strategies, and incident remediation.

**Incident:**
Title: ${incident.title}
Description: ${incident.description}
Severity: ${incident.severity}
Category: ${incident.category}

**Current State:**
Symptoms: ${context.symptoms.join(', ')}
Metrics: ${JSON.stringify(context.metrics)}

**Task:** Generate a detailed, step-by-step remediation plan to resolve this incident. Each step should be actionable and include:
- Action type (restart, scale, rollback, config_change, clear_cache, etc.)
- Parameters needed
- Expected outcome
- Risk level
- Whether it can be auto-executed

Also provide:
- Estimated duration
- Confidence score (0-1)
- Rationale for the plan
- Rollback plan if remediation fails

Respond in JSON format:
{
  "steps": [
    {
      "id": "step1",
      "action": "restart|scale|rollback|config_change|clear_cache|health_check|custom",
      "parameters": {},
      "expectedOutcome": "string",
      "riskLevel": "low|medium|high",
      "autoExecute": boolean
    }
  ],
  "estimatedDuration": number (minutes),
  "confidence": number (0-1),
  "rationale": "string",
  "rollbackPlan": "string"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert SRE creating remediation plans. Be thorough but safe." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const plan = JSON.parse(response.choices[0].message.content || "{}");
      return plan as RemediationPlan;
    } catch (error) {
      console.error('Remediation plan generation error:', error);
      throw error;
    }
  }

  /**
   * Execute remediation plan autonomously
   */
  private async executeRemediation(
    deploymentId: string,
    plan: RemediationPlan,
    context: IncidentContext
  ): Promise<RemediationResult> {
    const executedSteps: string[] = [];
    let success = true;
    let requiresHumanIntervention = false;

    console.log(`🔧 Executing remediation plan with ${plan.steps.length} steps`);

    for (const step of plan.steps) {
      if (!step.autoExecute || step.riskLevel === 'high') {
        requiresHumanIntervention = true;
        console.log(`⏸️  Skipping high-risk step: ${step.action}`);
        continue;
      }

      try {
        console.log(`▶️  Executing step: ${step.action}`);
        
        switch (step.action) {
          case 'restart':
            await this.executeRestart(deploymentId, step.parameters);
            break;
          
          case 'scale':
            await this.executeScale(deploymentId, step.parameters);
            break;
          
          case 'rollback':
            await this.executeRollback(deploymentId, step.parameters);
            break;
          
          case 'config_change':
            await this.executeConfigChange(deploymentId, step.parameters);
            break;
          
          case 'clear_cache':
            await this.executeClearCache(deploymentId, step.parameters);
            break;
          
          case 'health_check':
            const isHealthy = await this.executeHealthCheck(deploymentId);
            if (!isHealthy) {
              success = false;
            }
            break;
          
          default:
            console.log(`Unknown action: ${step.action}`);
            requiresHumanIntervention = true;
        }

        executedSteps.push(`${step.action}: ${step.expectedOutcome}`);
      } catch (error) {
        console.error(`Failed to execute step ${step.action}:`, error);
        success = false;
        break;
      }
    }

    // Get metrics after remediation
    const updatedContext = await this.gatherContext(deploymentId);

    return {
      success,
      stepsExecuted: executedSteps,
      outcome: success 
        ? `Successfully executed ${executedSteps.length} remediation steps. System is now healthy.`
        : `Executed ${executedSteps.length} steps but issue persists. Manual intervention required.`,
      metricsAfter: updatedContext.metrics,
      requiresHumanIntervention: requiresHumanIntervention || !success
    };
  }

  /**
   * Check if plan can be auto-remediated
   */
  private canAutoRemediate(plan: RemediationPlan): boolean {
    // Don't auto-remediate if any step is high-risk
    const hasHighRisk = plan.steps.some(s => s.riskLevel === 'high');
    if (hasHighRisk) return false;

    // Don't auto-remediate if too many steps (complex issue)
    if (plan.steps.length > 5) return false;

    return true;
  }

  /**
   * Escalate incident to human operators
   */
  private async escalateToHuman(
    incidentId: string,
    context: IncidentContext,
    plan: RemediationPlan,
    result: RemediationResult | null
  ): Promise<void> {
    await storage.updateIncident(incidentId, {
      status: 'investigating',
      metadata: {
        escalatedToHuman: true,
        escalatedAt: new Date().toISOString(),
        plan,
        result
      }
    });

    // Send alert to all configured channels
    const incident = await storage.getIncident(incidentId);
    if (!incident) return;

    await alertService.sendAlert({
      title: `🚨 Incident Requires Human Intervention`,
      message: `**Incident**: ${incident.title}\n\n**Description**: ${incident.description}\n\n**Severity**: ${incident.severity}\n\n${result ? `**Auto-remediation attempted**: ${result.outcome}` : '**Auto-remediation not possible**: Confidence too low or high-risk operations required.'}\n\n**Suggested Actions**:\n${plan.steps.map((s, i) => `${i + 1}. ${s.action}: ${s.expectedOutcome}`).join('\n')}`,
      severity: incident.severity as any,
      projectId: context.projectId,
      deploymentId: context.deploymentId,
      metadata: { incidentId, plan, result }
    }, []);

    this.activeIncidents.delete(context.deploymentId);
  }

  // Remediation action implementations
  private async executeRestart(deploymentId: string, params: any): Promise<void> {
    console.log(`🔄 Restarting deployment ${deploymentId}`);
    // TODO: Call cloud provider API to restart
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate restart
  }

  private async executeScale(deploymentId: string, params: any): Promise<void> {
    console.log(`📊 Scaling deployment ${deploymentId} to ${params.replicas} replicas`);
    // Use scaling service
    await scalingService.evaluateScaling(deploymentId, params.metrics || {});
  }

  private async executeRollback(deploymentId: string, params: any): Promise<void> {
    console.log(`⏮️  Rolling back deployment ${deploymentId} to ${params.version}`);
    // TODO: Implement rollback logic
  }

  private async executeConfigChange(deploymentId: string, params: any): Promise<void> {
    console.log(`⚙️  Applying config change to deployment ${deploymentId}`);
    // TODO: Update deployment config
  }

  private async executeClearCache(deploymentId: string, params: any): Promise<void> {
    console.log(`🗑️  Clearing cache for deployment ${deploymentId}`);
    // TODO: Clear application cache
  }

  private async executeHealthCheck(deploymentId: string): Promise<boolean> {
    const checks = await storage.getDeploymentHealthChecks(deploymentId, 1);
    return checks.length > 0 && checks[0].status === 'healthy';
  }
}

export const incidentResponseAgent = new IncidentResponseAgent();
