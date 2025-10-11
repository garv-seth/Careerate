/**
 * Agent API Routes
 * 
 * REST endpoints for all AI agents (Planner, Deployer, Monitor, Healer, Cost Optimizer)
 */

import { Router, Request, Response } from 'express';
import { PlannerAgent } from '../agents/plannerAgent';
import { DeployerAgent } from '../agents/deployerAgent';
import { MonitorAgent } from '../agents/monitorAgent';
import { HealerAgent } from '../agents/healerAgent';
import { CostOptimizerAgent } from '../agents/costOptimizerAgent';
import { orchestrator } from '../agents/orchestrator';
import { storageV2 } from '../storage-v2';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Initialize agents (singleton instances)
const plannerAgent = new PlannerAgent();
const deployerAgent = new DeployerAgent();
const monitorAgent = new MonitorAgent();
const healerAgent = new HealerAgent();
const costOptimizerAgent = new CostOptimizerAgent();

/**
 * POST /api/agent/session
 * Create new agent session
 */
router.post('/session', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { sessionType = 'deployment', initialContext } = req.body;
    const userId = req.user!.id;

    const sessionId = await orchestrator.createSession(userId, sessionType, initialContext);

    res.json({
      success: true,
      sessionId,
      message: 'Agent session created'
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session'
    });
  }
});

/**
 * DELETE /api/agent/session/:sessionId
 * End agent session
 */
router.delete('/session/:sessionId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await orchestrator.endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended'
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to end session'
    });
  }
});

/**
 * GET /api/agent/session/:sessionId
 * Get session details
 */
router.get('/session/:sessionId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await orchestrator.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session'
    });
  }
});

/**
 * POST /api/agent/plan
 * Create deployment plan (Planner Agent)
 */
router.post('/plan', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      naturalLanguageInput,
      repositoryUrl,
      framework,
      dependencies,
      environmentVariables,
      autonomyLevel = 'supervised',
      costLimit
    } = req.body;

    const userId = req.user!.id;

    // Validate input
    if (!naturalLanguageInput) {
      return res.status(400).json({
        success: false,
        error: 'naturalLanguageInput is required'
      });
    }

    // Create context
    const context = {
      userId,
      sessionId,
      autonomyLevel,
      costLimit
    };

    // Create deployment intent
    const intent = {
      naturalLanguageInput,
      repositoryUrl,
      framework,
      dependencies,
      environmentVariables
    };

    // Generate plan
    const plan = await plannerAgent.createDeploymentPlan(intent, context);

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create plan'
    });
  }
});

/**
 * POST /api/agent/deploy
 * Execute deployment plan (Deployer Agent)
 */
router.post('/deploy', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      planId,
      autonomyLevel = 'supervised',
      costLimit
    } = req.body;

    const userId = req.user!.id;

    // Validate input
    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'planId is required'
      });
    }

    // Create context
    const context = {
      userId,
      sessionId,
      autonomyLevel,
      costLimit
    };

    // Execute deployment
    const result = await deployerAgent.deploy(planId, context);

    res.json({
      success: true,
      deployment: result
    });
  } catch (error) {
    console.error('Deploy error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed'
    });
  }
});

/**
 * POST /api/agent/deploy/:deploymentId/scale
 * Scale deployment
 */
router.post('/deploy/:deploymentId/scale', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.params;
    const { instances, sessionId, autonomyLevel = 'supervised' } = req.body;
    const userId = req.user!.id;

    const context = {
      userId,
      sessionId,
      autonomyLevel
    };

    await deployerAgent.scale(deploymentId, instances, context);

    res.json({
      success: true,
      message: `Scaled to ${instances} instances`
    });
  } catch (error) {
    console.error('Scale error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Scaling failed'
    });
  }
});

/**
 * POST /api/agent/deploy/:deploymentId/stop
 * Stop deployment
 */
router.post('/deploy/:deploymentId/stop', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.params;
    const { sessionId, autonomyLevel = 'supervised' } = req.body;
    const userId = req.user!.id;

    const context = {
      userId,
      sessionId,
      autonomyLevel
    };

    await deployerAgent.stop(deploymentId, context);

    res.json({
      success: true,
      message: 'Deployment stopped'
    });
  } catch (error) {
    console.error('Stop error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop deployment'
    });
  }
});

/**
 * GET /api/agent/deploy/:deploymentId/status
 * Get deployment status
 */
router.get('/deploy/:deploymentId/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.params;
    const status = await deployerAgent.getDeploymentStatus(deploymentId);

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status'
    });
  }
});

/**
 * POST /api/agent/monitor/start
 * Start monitoring deployment (Monitor Agent)
 */
router.post('/monitor/start', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId, sessionId, intervalSeconds = 60, autonomyLevel = 'supervised' } = req.body;
    const userId = req.user!.id;

    const context = {
      userId,
      sessionId,
      autonomyLevel
    };

    await monitorAgent.startMonitoring(deploymentId, context, intervalSeconds);

    res.json({
      success: true,
      message: 'Monitoring started'
    });
  } catch (error) {
    console.error('Start monitoring error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start monitoring'
    });
  }
});

/**
 * POST /api/agent/monitor/stop
 * Stop monitoring deployment
 */
router.post('/monitor/stop', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.body;
    monitorAgent.stopMonitoring(deploymentId);

    res.json({
      success: true,
      message: 'Monitoring stopped'
    });
  } catch (error) {
    console.error('Stop monitoring error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop monitoring'
    });
  }
});

/**
 * GET /api/agent/monitor/:deploymentId/metrics
 * Get current metrics
 */
router.get('/monitor/:deploymentId/metrics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.params;
    const metrics = await monitorAgent.getMetrics(deploymentId);

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get metrics'
    });
  }
});

/**
 * GET /api/agent/monitor/:deploymentId/alerts
 * Get alerts for deployment
 */
router.get('/monitor/:deploymentId/alerts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.params;
    const { since } = req.query;

    const alerts = await monitorAgent.getAlerts(
      deploymentId,
      since ? new Date(since as string) : undefined
    );

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get alerts'
    });
  }
});

/**
 * POST /api/agent/heal
 * Diagnose and fix issue (Healer Agent)
 */
router.post('/heal', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deploymentId, alert, sessionId, autonomyLevel = 'supervised' } = req.body;
    const userId = req.user!.id;

    const context = {
      userId,
      sessionId,
      autonomyLevel
    };

    const result = await healerAgent.diagnoseAndFix(deploymentId, alert, context);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Heal error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Healing failed'
    });
  }
});

/**
 * GET /api/agent/cost/analyze
 * Analyze cloud spending (Cost Optimizer Agent)
 */
router.get('/cost/analyze', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { period = 'monthly', sessionId, autonomyLevel = 'supervised' } = req.query;

    const context = {
      userId,
      sessionId: sessionId as string,
      autonomyLevel: autonomyLevel as any
    };

    const analysis = await costOptimizerAgent.analyzeCosts(userId, context, period as any);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Cost analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Cost analysis failed'
    });
  }
});

/**
 * GET /api/agent/cost/recommendations
 * Get optimization recommendations
 */
router.get('/cost/recommendations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId, autonomyLevel = 'supervised' } = req.query;

    const context = {
      userId,
      sessionId: sessionId as string,
      autonomyLevel: autonomyLevel as any
    };

    const recommendations = await costOptimizerAgent.getOptimizationRecommendations(userId, context);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations'
    });
  }
});

/**
 * POST /api/agent/cost/optimize
 * Apply optimization
 */
router.post('/cost/optimize', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { recommendationId, sessionId, autonomyLevel = 'supervised' } = req.body;
    const userId = req.user!.id;

    const context = {
      userId,
      sessionId,
      autonomyLevel
    };

    const result = await costOptimizerAgent.applyOptimization(recommendationId, context);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Apply optimization error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Optimization failed'
    });
  }
});

/**
 * GET /api/agent/cost/budget
 * Check budget status
 */
router.get('/cost/budget', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const alert = await costOptimizerAgent.checkBudget(userId);

    res.json({
      success: true,
      alert: alert || null,
      message: alert ? 'Budget alert triggered' : 'Budget OK'
    });
  } catch (error) {
    console.error('Check budget error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Budget check failed'
    });
  }
});

/**
 * GET /api/agent/status
 * Get orchestrator status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = orchestrator.getStatus();

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status'
    });
  }
});

export default router;

