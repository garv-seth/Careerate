/**
 * Base Agent Class
 * 
 * Foundation for all AI agents with autonomy controls, action execution,
 * and comprehensive logging.
 */

import { kernelConfig, agentLogger, estimateAICost, estimateTokens } from './kernel.config';
import { storageV2 } from '../storage-v2';
import { alertService } from '../services/alertService';

export interface AgentContext {
  userId: string;
  sessionId: string;
  deploymentId?: string;
  projectId?: string;
  autonomyLevel: 'supervised' | 'semi-autonomous' | 'fully-autonomous';
  costLimit?: number; // in cents
  maxResourcesPerDeployment?: number;
}

export interface AgentAction {
  type: string;
  description: string;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  costImpact: number; // estimated cost in cents
  requiresApproval: boolean;
  resourcesAffected?: string[];
  rollbackAvailable?: boolean;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  tokensUsed?: number;
  costIncurred?: number;
  actionId?: string;
}

/**
 * Base Agent Abstract Class
 * 
 * All specialized agents (Planner, Deployer, Monitor, etc.) extend this class
 */
export abstract class BaseAgent {
  protected agentType: string;
  protected modelId: string;

  constructor(agentType: string, modelId: string) {
    this.agentType = agentType;
    this.modelId = modelId;
    agentLogger.info(`[${this.agentType}] Initialized with model: ${modelId}`);
  }

  /**
   * Execute agent action with autonomy checks and logging
   */
  protected async executeAction(
    action: AgentAction,
    context: AgentContext,
    executor: () => Promise<any>
  ): Promise<AgentResponse> {
    agentLogger.info(`[${this.agentType}] Executing action: ${action.type}`, {
      userId: context.userId,
      sessionId: context.sessionId,
      action: action.type,
      riskLevel: action.riskLevel,
      costImpact: action.costImpact
    });

    // Create action record in database
    const actionRecord = await storageV2.createAgentAction({
      userId: context.userId,
      agentSessionId: context.sessionId,
      actionType: action.type,
      agentType: this.agentType,
      modelUsed: this.modelId,
      actionDetails: action,
      reasoning: action.reasoning,
      riskLevel: action.riskLevel,
      requiresApproval: action.requiresApproval,
      costImpact: action.costImpact,
      resourcesAffected: action.resourcesAffected || [],
      rollbackAvailable: action.rollbackAvailable || false,
      status: 'pending'
    });

    try {
      // Check if approval is needed based on autonomy level
      if (this.needsApproval(action, context)) {
        agentLogger.info(`[${this.agentType}] Action requires user approval`, {
          actionId: actionRecord.id,
          riskLevel: action.riskLevel,
          autonomyLevel: context.autonomyLevel
        });

        await storageV2.updateAgentAction(actionRecord.id, {
          status: 'pending',
          requiresApproval: true
        });

        // Send notification to user about pending approval
        await this.notifyUserApprovalNeeded(context, action, actionRecord.id);

        // Return early - frontend will show approval modal
        return {
          success: false,
          error: 'USER_APPROVAL_REQUIRED',
          actionId: actionRecord.id
        };
      }

      // Check cost limits
      if (context.costLimit && action.costImpact > context.costLimit) {
        agentLogger.warn(`[${this.agentType}] Action exceeds cost limit`, {
          actionId: actionRecord.id,
          costImpact: action.costImpact,
          costLimit: context.costLimit
        });

        await storageV2.updateAgentAction(actionRecord.id, {
          status: 'failed',
          error: 'Cost limit exceeded'
        });

        return {
          success: false,
          error: `Action would cost $${action.costImpact / 100}, exceeding your limit of $${context.costLimit / 100}`
        };
      }

      // Execute the action
      agentLogger.info(`[${this.agentType}] Executing action...`, {
        actionId: actionRecord.id
      });

      const startTime = Date.now();
      const result = await executor();
      const executionTime = Date.now() - startTime;

      // Update action record with success
      await storageV2.updateAgentAction(actionRecord.id, {
        status: 'completed',
        result,
        executionTimeMs: executionTime,
        completedAt: new Date()
      });

      agentLogger.info(`[${this.agentType}] Action completed successfully`, {
        actionId: actionRecord.id,
        executionTime
      });

      // Notify user about completion (only in fully-autonomous mode)
      await this.notifyActionCompleted(context, action, result);

      return {
        success: true,
        data: result,
        actionId: actionRecord.id
      };

    } catch (error) {
      // Log failure
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await storageV2.updateAgentAction(actionRecord.id, {
        status: 'failed',
        error: errorMessage
      });

      agentLogger.error(`[${this.agentType}] Action failed`, {
        actionId: actionRecord.id,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });

      return {
        success: false,
        error: errorMessage,
        actionId: actionRecord.id
      };
    }
  }

  /**
   * Determine if action needs user approval based on autonomy level and risk
   */
  private needsApproval(action: AgentAction, context: AgentContext): boolean {
    // Always require approval for high-risk actions
    if (action.riskLevel === 'high') {
      agentLogger.debug(`[${this.agentType}] High-risk action requires approval`);
      return true;
    }

    // Check autonomy level
    switch (context.autonomyLevel) {
      case 'supervised':
        // Supervised mode: always ask
        agentLogger.debug(`[${this.agentType}] Supervised mode: approval required`);
        return true;

      case 'semi-autonomous':
        // Semi-autonomous: ask for medium+ risk or high cost
        const requiresApproval = 
          action.riskLevel === 'medium' || 
          action.costImpact > 5000; // >$50/month

        if (requiresApproval) {
          agentLogger.debug(`[${this.agentType}] Semi-autonomous: approval required (risk=${action.riskLevel}, cost=$${action.costImpact / 100})`);
        }
        return requiresApproval;

      case 'fully-autonomous':
        // Fully autonomous: only ask for explicitly flagged actions
        if (action.requiresApproval) {
          agentLogger.debug(`[${this.agentType}] Fully autonomous: action explicitly requires approval`);
        }
        return action.requiresApproval;

      default:
        // Unknown level, err on the side of caution
        agentLogger.warn(`[${this.agentType}] Unknown autonomy level: ${context.autonomyLevel}, requiring approval`);
        return true;
    }
  }

  /**
   * Invoke AI model with prompt
   * 
   * @param prompt User prompt
   * @param systemMessage Optional system message
   * @param maxTokens Maximum output tokens
   * @returns AI response text
   */
  protected async invoke(
    prompt: string,
    systemMessage?: string,
    maxTokens: number = 4000
  ): Promise<{ response: string; tokensUsed: number; cost: number }> {
    // Get model configuration
    const model = kernelConfig.getModel(this.modelId);
    
    if (!model) {
      throw new Error(`Model ${this.modelId} not configured`);
    }

    agentLogger.debug(`[${this.agentType}] Invoking ${this.modelId}`, {
      promptLength: prompt.length,
      maxTokens
    });

    // Estimate input tokens
    const inputTokens = estimateTokens(prompt) + (systemMessage ? estimateTokens(systemMessage) : 0);

    try {
      // In production, this would call actual Azure AI Foundry endpoint
      // For now, this is a placeholder that demonstrates the structure
      
      // Simulated API call structure:
      /*
      const response = await fetch(model.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`
        },
        body: JSON.stringify({
          messages: [
            ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const responseText = data.choices[0].message.content;
      */

      // Placeholder response for development
      const responseText = `[${this.modelId}] AI response placeholder. In production, this would be the actual model output.`;
      const outputTokens = estimateTokens(responseText);
      const totalTokens = inputTokens + outputTokens;
      const cost = estimateAICost(this.modelId, inputTokens, outputTokens);

      agentLogger.debug(`[${this.agentType}] Model response received`, {
        inputTokens,
        outputTokens,
        totalTokens,
        cost
      });

      return {
        response: responseText,
        tokensUsed: totalTokens,
        cost
      };

    } catch (error) {
      agentLogger.error(`[${this.agentType}] Model invocation failed`, {
        error: error instanceof Error ? error.message : error,
        modelId: this.modelId
      });
      throw error;
    }
  }

  /**
   * Stream progress update to user (via SSE or WebSocket)
   */
  protected async streamUpdate(
    sessionId: string,
    message: string,
    data?: any
  ): Promise<void> {
    agentLogger.debug(`[${this.agentType}] Streaming update`, {
      sessionId,
      message
    });

    // In production, this would emit to SSE or WebSocket
    // For now, just log
    // Example: sseService.emit(sessionId, { type: 'agent-update', message, data });
  }

  /**
   * Get agent's current session
   */
  protected async getSession(sessionId: string) {
    return await storageV2.getAgentSession(sessionId);
  }

  /**
   * Update session with new conversation history
   */
  protected async updateSessionHistory(
    sessionId: string,
    message: { role: string; content: string; timestamp: Date }
  ) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const history = Array.isArray(session.conversationHistory) 
      ? session.conversationHistory 
      : [];

    return await storageV2.updateAgentSession(sessionId, {
      conversationHistory: [...history, message],
      updatedAt: new Date()
    });
  }

  /**
   * Calculate total cost for session
   */
  protected async calculateSessionCost(sessionId: string): Promise<number> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return 0;
    }

    // Get all actions for this session
    const actions = await storageV2.getSessionAgentActions(sessionId);
    
    // Sum up cost impacts
    const totalCost = actions.reduce((sum, action) => {
      return sum + (action.costImpact || 0);
    }, 0);

    return totalCost;
  }

  /**
   * Notify user that approval is needed for an action
   */
  private async notifyUserApprovalNeeded(
    context: AgentContext,
    action: AgentAction,
    actionId: string
  ): Promise<void> {
    try {
      // Get user's configured alert channels from storage
      const user = await storageV2.getUser(context.userId);
      if (!user) {
        agentLogger.warn(`[${this.agentType}] User not found for notification: ${context.userId}`);
        return;
      }

      // Send notification through available channels
      // Note: In production, fetch user's preferred notification channels from database
      const channelIds: string[] = []; // TODO: Load from user settings

      await alertService.sendAlert(
        {
          title: `Action Approval Required - ${this.agentType}`,
          message: `${action.description}\n\nRisk: ${action.riskLevel}\nCost Impact: $${(action.costImpact / 100).toFixed(2)}\n\nReasoning: ${action.reasoning}`,
          severity: action.riskLevel === 'high' ? 'critical' : 'warning',
          projectId: context.projectId || context.deploymentId || context.sessionId,
          metadata: { actionId, action, autonomyLevel: context.autonomyLevel },
          actionUrl: `https://gocareerate.com/agent?actionId=${actionId}`
        },
        channelIds
      );

      agentLogger.info(`[${this.agentType}] Approval notification sent`, { actionId });
    } catch (error) {
      agentLogger.error(`[${this.agentType}] Failed to send approval notification`, {
        error: error instanceof Error ? error.message : error
      });
      // Don't throw - notification failure shouldn't block the action
    }
  }

  /**
   * Notify user about completed action (for fully-autonomous mode)
   */
  protected async notifyActionCompleted(
    context: AgentContext,
    action: AgentAction,
    result: any
  ): Promise<void> {
    // Only notify in fully-autonomous mode
    if (context.autonomyLevel !== 'fully-autonomous') {
      return;
    }

    try {
      const user = await storageV2.getUser(context.userId);
      if (!user) return;

      const channelIds: string[] = []; // TODO: Load from user settings

      await alertService.sendAlert(
        {
          title: `Action Completed - ${this.agentType}`,
          message: `${action.description}\n\nCompleted successfully in fully-autonomous mode.\n\nReasoning: ${action.reasoning}`,
          severity: 'info',
          projectId: context.projectId || context.deploymentId || context.sessionId,
          metadata: { action, result, autonomyLevel: context.autonomyLevel }
        },
        channelIds
      );

      agentLogger.info(`[${this.agentType}] Completion notification sent`);
    } catch (error) {
      agentLogger.error(`[${this.agentType}] Failed to send completion notification`, {
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  abstract getName(): string;
}

/**
 * Agent Action Builder (Fluent API)
 */
export class AgentActionBuilder {
  private action: Partial<AgentAction> = {
    riskLevel: 'low',
    costImpact: 0,
    requiresApproval: false,
    rollbackAvailable: false
  };

  type(type: string): this {
    this.action.type = type;
    return this;
  }

  description(description: string): this {
    this.action.description = description;
    return this;
  }

  reasoning(reasoning: string): this {
    this.action.reasoning = reasoning;
    return this;
  }

  risk(level: 'low' | 'medium' | 'high'): this {
    this.action.riskLevel = level;
    return this;
  }

  cost(cents: number): this {
    this.action.costImpact = cents;
    return this;
  }

  requiresApproval(required: boolean = true): this {
    this.action.requiresApproval = required;
    return this;
  }

  affectsResources(resources: string[]): this {
    this.action.resourcesAffected = resources;
    return this;
  }

  canRollback(can: boolean = true): this {
    this.action.rollbackAvailable = can;
    return this;
  }

  build(): AgentAction {
    // Validate required fields
    if (!this.action.type || !this.action.description || !this.action.reasoning) {
      throw new Error('AgentAction must have type, description, and reasoning');
    }

    return this.action as AgentAction;
  }
}

