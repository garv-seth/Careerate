/**
 * Agent Orchestrator
 * 
 * Manages lifecycle of all AI agents, coordinates multi-agent workflows,
 * and provides unified interface for agent operations.
 */

import { kernelConfig, agentLogger } from './kernel.config';
import { storageV2 } from '../storage-v2';

export interface OrchestratorConfig {
  enableAutoInit?: boolean; // Auto-initialize on first use
  maxConcurrentSessions?: number; // Limit concurrent agent sessions
}

/**
 * Agent Orchestrator Class
 * 
 * Central coordinator for all AI agents in the system
 */
export class AgentOrchestrator {
  private initialized: boolean = false;
  private activeSessions: Map<string, any> = new Map();
  private config: OrchestratorConfig;

  // Agent instances (lazy-loaded)
  private agents: Map<string, any> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      enableAutoInit: true,
      maxConcurrentSessions: 100,
      ...config
    };

    agentLogger.info('Agent Orchestrator created', { config: this.config });
  }

  /**
   * Initialize the orchestrator and kernel
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      agentLogger.debug('Orchestrator already initialized');
      return;
    }

    agentLogger.info('Initializing Agent Orchestrator...');

    try {
      // Initialize Semantic Kernel
      await kernelConfig.initialize();

      // Check available models (non-fatal if none configured)
      const availableModels = kernelConfig.getAvailableModels();
      if (availableModels.length === 0) {
        agentLogger.warn('No AI models configured. Agent functionality will be limited.');
      } else {
        agentLogger.info(`Kernel initialized with models: ${availableModels.join(', ')}`);
      }

      // Agent instances will be lazy-loaded when first requested
      this.initialized = true;

      agentLogger.info('✓ Agent Orchestrator initialized successfully');
    } catch (error) {
      agentLogger.error('Failed to initialize Agent Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Ensure orchestrator is initialized (auto-init if enabled)
   * Made public so routes can call it
   */
  async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.config.enableAutoInit) {
      await this.initialize();
    }

    if (!this.initialized) {
      throw new Error('Orchestrator not initialized. Call initialize() first.');
    }
  }

  /**
   * Create a new agent session
   */
  async createSession(
    userId: string,
    sessionType: 'deployment' | 'monitoring' | 'cost-optimization' | 'general' = 'deployment',
    initialContext?: any
  ): Promise<string> {
    await this.ensureInitialized();

    // Check concurrent session limit
    if (this.activeSessions.size >= this.config.maxConcurrentSessions!) {
      throw new Error(`Maximum concurrent sessions (${this.config.maxConcurrentSessions}) reached`);
    }

    // Create session in database
    const session = await storageV2.createAgentSession({
      userId,
      sessionType,
      conversationHistory: [],
      currentContext: initialContext || {},
      agentState: {},
      status: 'active',
      modelUsed: null,
      totalTokens: 0,
      totalCost: 0
    });

    // Track active session
    this.activeSessions.set(session.id, {
      userId,
      sessionType,
      createdAt: new Date()
    });

    agentLogger.info(`Session created: ${session.id}`, {
      userId,
      sessionType,
      activeSessions: this.activeSessions.size
    });

    return session.id;
  }

  /**
   * End an agent session
   */
  async endSession(sessionId: string): Promise<void> {
    await this.ensureInitialized();

    // Complete session in database
    await storageV2.completeAgentSession(sessionId);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    agentLogger.info(`Session ended: ${sessionId}`, {
      activeSessions: this.activeSessions.size
    });
  }

  /**
   * Get session info
   */
  async getSession(sessionId: string) {
    await this.ensureInitialized();
    return await storageV2.getAgentSession(sessionId);
  }

  /**
   * Get all active sessions for a user
   */
  async getUserActiveSessions(userId: string) {
    await this.ensureInitialized();
    
    const sessions = await storageV2.getUserAgentSessions(userId);
    return sessions.filter(s => s.status === 'active');
  }

  /**
   * Get or create agent instance
   * 
   * Agents are lazy-loaded and cached
   */
  private async getAgent(agentType: string): Promise<any> {
    await this.ensureInitialized();

    // Check cache
    if (this.agents.has(agentType)) {
      return this.agents.get(agentType);
    }

    // Create agent instance based on type
    let agent: any;

    switch (agentType) {
      case 'planner':
        // Will be implemented in Phase 5
        // const { PlannerAgent } = await import('./plannerAgent');
        // agent = new PlannerAgent(kernelConfig);
        agentLogger.warn('PlannerAgent not yet implemented');
        agent = null;
        break;

      case 'deployer':
        // Will be implemented in Phase 5
        // const { DeployerAgent } = await import('./deployerAgent');
        // agent = new DeployerAgent(kernelConfig);
        agentLogger.warn('DeployerAgent not yet implemented');
        agent = null;
        break;

      case 'monitor':
        // Will be implemented in Phase 5
        // const { MonitorAgent } = await import('./monitorAgent');
        // agent = new MonitorAgent(kernelConfig);
        agentLogger.warn('MonitorAgent not yet implemented');
        agent = null;
        break;

      case 'healer':
        // Will be implemented in Phase 5
        // const { HealerAgent } = await import('./healerAgent');
        // agent = new HealerAgent(kernelConfig);
        agentLogger.warn('HealerAgent not yet implemented');
        agent = null;
        break;

      case 'cost-optimizer':
        // Will be implemented in Phase 5
        // const { CostOptimizerAgent } = await import('./costOptimizerAgent');
        // agent = new CostOptimizerAgent(kernelConfig);
        agentLogger.warn('CostOptimizerAgent not yet implemented');
        agent = null;
        break;

      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Cache agent
    if (agent) {
      this.agents.set(agentType, agent);
      agentLogger.info(`Agent loaded: ${agentType}`);
    }

    return agent;
  }

  /**
   * Invoke planner agent
   */
  async invokePlanner(sessionId: string, input: string, context: any): Promise<any> {
    const agent = await this.getAgent('planner');
    if (!agent) {
      throw new Error('Planner agent not available');
    }
    // Will call agent.analyzeIntent(input, context) when implemented
    return { message: 'Planner agent not yet implemented' };
  }

  /**
   * Invoke deployer agent
   */
  async invokeDeployer(sessionId: string, plan: any, context: any): Promise<any> {
    const agent = await this.getAgent('deployer');
    if (!agent) {
      throw new Error('Deployer agent not available');
    }
    // Will call agent.execute(plan, context) when implemented
    return { message: 'Deployer agent not yet implemented' };
  }

  /**
   * Invoke monitor agent
   */
  async invokeMonitor(deploymentId: string): Promise<any> {
    const agent = await this.getAgent('monitor');
    if (!agent) {
      throw new Error('Monitor agent not available');
    }
    // Will call agent.watchDeployment(deploymentId) when implemented
    return { message: 'Monitor agent not yet implemented' };
  }

  /**
   * Invoke healer agent
   */
  async invokeHealer(deploymentId: string, issue: any): Promise<any> {
    const agent = await this.getAgent('healer');
    if (!agent) {
      throw new Error('Healer agent not available');
    }
    // Will call agent.diagnoseAndFix(deploymentId, issue) when implemented
    return { message: 'Healer agent not yet implemented' };
  }

  /**
   * Invoke cost optimizer agent
   */
  async invokeCostOptimizer(userId: string, deploymentId?: string): Promise<any> {
    const agent = await this.getAgent('cost-optimizer');
    if (!agent) {
      throw new Error('Cost optimizer agent not available');
    }
    // Will call agent.analyze(userId, deploymentId) when implemented
    return { message: 'Cost optimizer agent not yet implemented' };
  }

  /**
   * Get orchestrator status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      activeSessions: this.activeSessions.size,
      maxConcurrentSessions: this.config.maxConcurrentSessions,
      loadedAgents: Array.from(this.agents.keys()),
      availableModels: kernelConfig.getAvailableModels()
    };
  }

  /**
   * Cleanup (for graceful shutdown)
   */
  async cleanup(): Promise<void> {
    agentLogger.info('Cleaning up Agent Orchestrator...');

    // End all active sessions
    for (const sessionId of this.activeSessions.keys()) {
      try {
        await this.endSession(sessionId);
      } catch (error) {
        agentLogger.error(`Failed to end session ${sessionId}:`, error);
      }
    }

    // Clear caches
    this.agents.clear();
    this.activeSessions.clear();

    this.initialized = false;

    agentLogger.info('✓ Agent Orchestrator cleanup complete');
  }
}

// Export singleton instance
export const orchestrator = new AgentOrchestrator({
  enableAutoInit: true,
  maxConcurrentSessions: 100
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  agentLogger.info('SIGTERM received, cleaning up orchestrator...');
  await orchestrator.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  agentLogger.info('SIGINT received, cleaning up orchestrator...');
  await orchestrator.cleanup();
  process.exit(0);
});

