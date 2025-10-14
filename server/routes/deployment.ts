/**
 * Deployment API Routes
 * User types "Deploy my app" → AI creates plan → Deploys to Azure
 */

import express from 'express';
import { PlannerAgent } from '../agents/plannerAgent';
import { DeployerAgent } from '../agents/deployerAgent';
import { storageV2 } from '../storage-v2';

const router = express.Router();

const planner = new PlannerAgent();
const deployer = new DeployerAgent();

/**
 * POST /api/deploy/plan
 * User describes what they want to deploy
 * AI creates deployment plan
 */
router.post('/plan', async (req, res) => {
  try {
    const { input, repoUrl, framework } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!input) {
      return res.status(400).json({ error: 'Missing input field' });
    }

    console.log(`[DeploymentAPI] Creating plan for user ${userId}`);
    console.log(`[DeploymentAPI] Input: ${input}`);

    // Use Planner Agent (GPT-4o direct API)
    const plan = await planner.analyze(input, { repoUrl, framework });

    // Store plan in database
    const savedPlan = await storageV2.createDeploymentPlan({
      userId,
      naturalLanguageInput: input,
      provider: plan.infrastructure.compute.toLowerCase().includes('azure') ? 'azure' :
                plan.infrastructure.compute.toLowerCase().includes('aws') ? 'aws' : 'gcp',
      region: plan.region,
      architecture: plan.infrastructure,
      costEstimate: plan.costEstimate,
      reasoning: plan.reasoning,
      status: 'pending'
    });

    res.json({
      planId: savedPlan.id,
      plan
    });

  } catch (error) {
    console.error('[DeploymentAPI] Planning failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/deploy/execute
 * Execute approved deployment plan
 */
router.post('/execute', async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'Missing planId' });
    }

    // Get plan from database
    const planRecord = await storageV2.getDeploymentPlan(planId);

    if (!planRecord) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (planRecord.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (planRecord.status !== 'pending') {
      return res.status(400).json({ error: 'Plan already executed or rejected' });
    }

    // Convert stored plan to DeploymentPlan
    const plan = {
      appName: planRecord.architecture.compute?.toLowerCase().replace(/\s+/g, '-') || `app-${Date.now()}`,
      techStack: 'unknown',
      infrastructure: planRecord.architecture,
      region: planRecord.region,
      costEstimate: planRecord.costEstimate,
      reasoning: planRecord.reasoning
    };

    console.log(`[DeploymentAPI] Executing plan ${planId}`);

    // Deploy with Deployer Agent (REAL Azure SDK)
    const result = await deployer.deploy(plan, userId);

    // Update plan status
    await storageV2.updateDeploymentPlan(planId, { status: 'deployed' });

    // Create deployment record
    await storageV2.createDeployment({
      userId,
      appName: result.appName,
      url: result.url,
      provider: planRecord.provider,
      region: result.region,
      status: 'deployed',
      deployedAt: result.createdAt
    });

    res.json({
      success: true,
      deployment: result
    });

  } catch (error) {
    console.error('[DeploymentAPI] Deployment failed:', error);

    // Update plan status to failed
    if (req.body.planId) {
      await storageV2.updateDeploymentPlan(req.body.planId, { status: 'failed' });
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/deploy/status/:appName
 * Get deployment status
 */
router.get('/status/:appName', async (req, res) => {
  try {
    const { appName } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const status = await deployer.getStatus(appName);

    res.json(status);

  } catch (error) {
    console.error('[DeploymentAPI] Status check failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/deploy/:appName
 * Delete deployment
 */
router.delete('/:appName', async (req, res) => {
  try {
    const { appName } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await deployer.delete(appName);

    res.json({ success: true, message: `Deleted ${appName}` });

  } catch (error) {
    console.error('[DeploymentAPI] Deletion failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
