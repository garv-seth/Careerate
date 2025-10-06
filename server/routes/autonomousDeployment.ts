/**
 * Autonomous Deployment Routes
 * Implements the complete "Vibe Hosting" workflow with agent orchestration
 */

import { Router } from 'express';
import { agentOrchestrator } from '../services/agentOrchestrator';
import { techStackDetector } from '../services/techStackDetector';
import { monitoringAutomation } from '../services/monitoringAutomation';
import { multiCloudOAuth } from '../services/multiCloudOAuth';
import { storage } from '../storage';
import { isAuthenticated } from '../azureAuth';

const router = Router();

// Helper to get user ID
const getUserId = (req: any): string => {
  return req.user?.id || req.user?.sub || '';
};

/**
 * POST /api/autonomous/deploy
 * Complete autonomous deployment workflow
 *
 * User says: "Deploy my Node.js app to AWS with auto-scaling"
 * Agent does: Parse intent → Detect stack → Generate plan → Get approval → Execute
 */
router.post('/deploy', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { naturalLanguageInput, repositoryUrl, repositoryFiles } = req.body;

    if (!naturalLanguageInput) {
      return res.status(400).json({ error: 'Natural language input required' });
    }

    // Step 1: Detect tech stack from repository
    let techStack;
    if (repositoryFiles) {
      techStack = await techStackDetector.detectFromRepository(repositoryFiles);
      console.log(`✅ Detected tech stack: ${techStack.framework} (confidence: ${techStack.confidence})`);
    }

    // Step 2: Parse deployment intent with AI agent
    const plan = await agentOrchestrator.parseIntent({
      projectId: req.body.projectId || `project-${Date.now()}`,
      userId,
      naturalLanguageInput,
      context: {
        repositoryUrl,
        framework: techStack?.framework,
        dependencies: techStack?.dependencies.production
      }
    });

    console.log(`✅ Generated deployment plan: ${plan.provider} in ${plan.region}`);

    // Step 3: Return plan for user approval
    res.json({
      success: true,
      planId: plan.planId,
      plan: {
        provider: plan.provider,
        region: plan.region,
        architecture: plan.architecture,
        scalingPolicy: plan.scalingPolicy,
        monitoring: plan.monitoring,
        costEstimate: plan.costEstimate,
        reasoning: plan.reasoning,
        steps: plan.steps,
        securityChecks: plan.securityChecks,
        complianceChecks: plan.complianceChecks
      },
      techStack,
      approvalRequired: true,
      message: 'Review and approve the deployment plan to proceed'
    });

  } catch (error: any) {
    console.error('Autonomous deployment error:', error);
    res.status(500).json({
      error: 'Deployment planning failed',
      message: error.message
    });
  }
});

/**
 * POST /api/autonomous/plans/:planId/approve
 * User approves the deployment plan
 */
router.post('/plans/:planId/approve', isAuthenticated, async (req, res) => {
  try {
    const { planId } = req.params;

    // Update plan status
    await storage.updateDeploymentPlan(planId, { status: 'approved' });

    res.json({
      success: true,
      message: 'Plan approved. Ready for execution.',
      executeUrl: `/api/autonomous/plans/${planId}/execute`
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/autonomous/plans/:planId/execute
 * Execute approved deployment plan with real-time feedback
 */
router.post('/plans/:planId/execute', isAuthenticated, async (req, res) => {
  try {
    const { planId } = req.params;

    // Set up SSE for real-time updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    res.write(`data: ${JSON.stringify({ type: 'started', message: 'Deployment started...' })}\n\n`);

    // Execute plan with progress callback
    const result = await agentOrchestrator.executePlan(planId, (step, progress) => {
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        step,
        progress,
        timestamp: new Date()
      })}\n\n`);
    });

    if (result.success) {
      // Setup monitoring automatically
      const plan = await storage.getDeploymentPlan(planId);

      if (plan && plan.monitoring?.enabled) {
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          step: 'Setting up monitoring...',
          progress: 95
        })}\n\n`);

        await monitoringAutomation.setupMonitoring({
          provider: plan.monitoring.provider,
          deploymentId: result.deploymentId,
          metrics: ['cpu', 'memory', 'requests', 'errors'],
          alertThresholds: {
            cpu: 80,
            memory: 85,
            errorRate: 10,
            responseTime: 2000
          },
          notificationChannels: plan.monitoring.alertChannels || []
        });

        // Setup auto-scaling
        if (plan.scalingPolicy) {
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            step: 'Configuring auto-scaling...',
            progress: 97
          })}\n\n`);

          await monitoringAutomation.configureAutoScaling({
            deploymentId: result.deploymentId,
            minInstances: plan.scalingPolicy.minInstances,
            maxInstances: plan.scalingPolicy.maxInstances,
            targetCPU: plan.scalingPolicy.cpuThreshold,
            targetMemory: plan.scalingPolicy.memoryThreshold,
            scaleUpCooldown: 300,
            scaleDownCooldown: 600
          });
        }

        // Setup security monitoring
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          step: 'Enabling security monitoring...',
          progress: 99
        })}\n\n`);

        await monitoringAutomation.setupSecurityMonitoring(result.deploymentId);
      }

      res.write(`data: ${JSON.stringify({
        type: 'completed',
        success: true,
        deploymentId: result.deploymentId,
        url: result.url,
        message: '🎉 Deployment completed successfully!'
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'failed',
        success: false,
        error: result.error,
        message: '❌ Deployment failed'
      })}\n\n`);
    }

    res.end();

  } catch (error: any) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message
    })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/autonomous/capabilities
 * Get agent's capabilities (what it can do)
 */
router.get('/capabilities', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const capabilities = agentOrchestrator.getCapabilities();

    // Check which capabilities user can access
    const accessibleCapabilities = await Promise.all(
      capabilities.map(async (cap) => ({
        ...cap,
        accessible: await agentOrchestrator.canPerformAction(cap.name.toLowerCase().replace(/\s+/g, '_'), userId)
      }))
    );

    res.json({
      capabilities: accessibleCapabilities,
      summary: {
        total: capabilities.length,
        accessible: accessibleCapabilities.filter(c => c.accessible).length,
        requireAuth: accessibleCapabilities.filter(c => c.requiresAuth).length
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/autonomous/connect/:provider
 * Connect cloud provider OAuth
 */
router.post('/connect/:provider', isAuthenticated, async (req, res) => {
  try {
    const { provider } = req.params;
    const userId = getUserId(req);

    switch (provider) {
      case 'github':
        const github = await multiCloudOAuth.initiateGitHubOAuth(req.body.redirectUri);
        res.json({ authUrl: github.authUrl, state: github.state });
        break;

      case 'gitlab':
        const gitlab = await multiCloudOAuth.initiateGitLabOAuth(req.body.redirectUri);
        res.json({ authUrl: gitlab.authUrl, state: gitlab.state });
        break;

      case 'aws':
        const awsResult = await multiCloudOAuth.connectAWS(
          userId,
          req.body.accessKeyId,
          req.body.secretAccessKey,
          req.body.region
        );
        res.json(awsResult);
        break;

      case 'gcp':
        const gcpResult = await multiCloudOAuth.connectGCP(
          userId,
          req.body.serviceAccountJson,
          req.body.projectId
        );
        res.json(gcpResult);
        break;

      case 'railway':
        const railwayResult = await multiCloudOAuth.connectRailway(
          userId,
          req.body.apiToken
        );
        res.json(railwayResult);
        break;

      case 'vercel':
        const vercel = await multiCloudOAuth.initiateVercelOAuth(req.body.redirectUri);
        res.json({ authUrl: vercel.authUrl, state: vercel.state });
        break;

      default:
        res.status(400).json({ error: 'Unknown provider' });
    }

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/autonomous/health
 * Platform health check
 */
router.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    services: {
      agentOrchestrator: 'operational',
      techStackDetector: 'operational',
      monitoringAutomation: 'operational',
      multiCloudOAuth: 'operational'
    },
    version: '2.0.0'
  });
});

export default router;
