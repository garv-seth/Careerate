/**
 * Runbook Routes
 * API endpoints for incident auto-mitigation and blue/green deployments
 */

import { Router } from 'express';
import { isAuthenticated } from '../azureAuth';
import { incidentAutoMitigation } from '../services/runbooks/incidentAutoMitigation';
import { blueGreenDeploy } from '../services/runbooks/blueGreenDeploy';
import { rbacService } from '../services/governance/rbacService';
import { auditService } from '../services/governance/auditService';

const router = Router();

// Helper to get user ID
const getUserId = (req: any): string => {
  return req.user?.id || req.user?.sub || req.user?.email || 'unknown';
};

// ========== INCIDENT AUTO-MITIGATION ROUTES ==========

/**
 * POST /api/runbooks/incident/detect
 * Detect an incident from metrics/alerts
 */
router.post('/incident/detect', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);

    // Check permission
    const hasPermission = await rbacService.hasPermission({
      userId,
      action: 'request-runbook-execution',
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const incident = await incidentAutoMitigation.detectIncident(req.body);

    res.json({
      success: true,
      incident,
      nextSteps: [
        'Review the incident details',
        'Request triage summary',
        'Generate mitigation plan',
      ],
    });
  } catch (error: any) {
    console.error('Incident detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/runbooks/incident/:id/triage
 * Generate AI-powered triage summary
 */
router.post('/incident/:id/triage', isAuthenticated, async (req, res) => {
  try {
    const { id: incidentId } = req.params;

    const triage = await incidentAutoMitigation.triageSummary(incidentId);

    res.json({
      success: true,
      triage,
      nextSteps: ['Generate mitigation plan with dry-run'],
    });
  } catch (error: any) {
    console.error('Triage error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/runbooks/incident/:id/plan
 * Generate mitigation plan (dry-run by default)
 */
router.post('/incident/:id/plan', isAuthenticated, async (req, res) => {
  try {
    const { id: incidentId } = req.params;
    const userId = getUserId(req);
    const { dryRun = true } = req.body;

    const plan = await incidentAutoMitigation.generateMitigationPlan(
      incidentId,
      userId,
      dryRun
    );

    // Check policies
    const policyChecks = await incidentAutoMitigation.checkPolicies(plan, userId);

    res.json({
      success: true,
      plan,
      policyChecks,
      nextSteps: policyChecks.passed
        ? ['Request approval for mitigation']
        : ['Review policy violations', 'Adjust plan or request exception'],
    });
  } catch (error: any) {
    console.error('Plan generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/runbooks/incident/:id/request-approval
 * Request approval for mitigation
 */
router.post('/incident/:id/request-approval', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { plan, policyChecks } = req.body;

    const approvalRequestId = await incidentAutoMitigation.requestApproval(
      plan,
      userId,
      policyChecks
    );

    res.json({
      success: true,
      approvalRequestId,
      message: 'Approval request created. Awaiting approver action.',
      nextSteps: ['Wait for approval', 'Monitor approval status'],
    });
  } catch (error: any) {
    console.error('Approval request error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/runbooks/incident/execute
 * Execute approved mitigation (SSE for real-time updates)
 */
router.post('/incident/execute', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { approvalRequestId } = req.body;

    // Check permission to execute
    const hasPermission = await rbacService.hasPermission({
      userId,
      action: 'execute-runbook',
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to execute runbooks' });
    }

    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'started', message: 'Mitigation started...' })}\n\n`);

    // Execute mitigation
    const result = await incidentAutoMitigation.executeMitigation(approvalRequestId, userId);

    if (result.success) {
      res.write(`data: ${JSON.stringify({
        type: 'completed',
        success: true,
        result,
        message: '✅ Mitigation completed successfully!',
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'failed',
        success: false,
        result,
        message: '❌ Mitigation failed',
      })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message,
    })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/runbooks/incident/:executionId/audit
 * Download audit report (PDF or JSON)
 */
router.get('/incident/:executionId/audit', isAuthenticated, async (req, res) => {
  try {
    const { executionId } = req.params;
    const { format = 'pdf' } = req.query;
    const userId = getUserId(req);

    // Check permission
    const hasPermission = await rbacService.hasPermission({
      userId,
      action: 'export-audit-logs',
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to export audit logs' });
    }

    const report = await auditService.generateExecutionReport(
      executionId,
      format as 'pdf' | 'json'
    );

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="incident-audit-${executionId}.pdf"`
      );
      res.send(report);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="incident-audit-${executionId}.json"`
      );
      res.send(report);
    }
  } catch (error: any) {
    console.error('Audit export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== BLUE/GREEN DEPLOYMENT ROUTES ==========

/**
 * POST /api/runbooks/bluegreen/plan
 * Create deployment plan (dry-run + diff)
 */
router.post('/bluegreen/plan', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { dryRun = true } = req.body;

    const plan = await blueGreenDeploy.createDeploymentPlan(
      req.body.spec,
      userId,
      dryRun
    );

    // Check policies
    const policyChecks = await blueGreenDeploy.checkPolicies(plan, userId);

    res.json({
      success: true,
      plan,
      policyChecks,
      nextSteps: policyChecks.passed
        ? ['Request approval for deployment']
        : ['Review policy violations', 'Adjust plan or request exception'],
    });
  } catch (error: any) {
    console.error('Deployment plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/runbooks/bluegreen/request-approval
 * Request approval for deployment
 */
router.post('/bluegreen/request-approval', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { plan, policyChecks } = req.body;

    const approvalRequestId = await blueGreenDeploy.requestApproval(
      plan,
      userId,
      policyChecks
    );

    res.json({
      success: true,
      approvalRequestId,
      message: 'Approval request created. Awaiting approver action.',
      nextSteps: ['Wait for approval', 'Monitor approval status'],
    });
  } catch (error: any) {
    console.error('Approval request error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/runbooks/bluegreen/execute
 * Execute approved deployment (SSE for real-time updates)
 */
router.post('/bluegreen/execute', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { approvalRequestId } = req.body;

    // Check permission to execute
    const hasPermission = await rbacService.hasPermission({
      userId,
      action: 'execute-runbook',
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to execute deployments' });
    }

    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'started', message: 'Deployment started...' })}\n\n`);

    // Execute deployment with progress callback
    const result = await blueGreenDeploy.executeDeployment(
      approvalRequestId,
      userId,
      (phase, progress) => {
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          phase,
          progress,
          timestamp: new Date(),
        })}\n\n`);
      }
    );

    if (result.success) {
      res.write(`data: ${JSON.stringify({
        type: 'completed',
        success: true,
        result,
        message: '🎉 Deployment completed successfully!',
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'failed',
        success: false,
        result,
        message: result.rolledBack ? '↩️ Deployment failed and rolled back' : '❌ Deployment failed',
      })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message,
    })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/runbooks/bluegreen/:serviceName/traffic/:percentage
 * Manual traffic shift
 */
router.post('/bluegreen/:serviceName/traffic/:percentage', isAuthenticated, async (req, res) => {
  try {
    const { serviceName, percentage } = req.params;
    const { provider, greenEnvironmentId } = req.body;
    const userId = getUserId(req);

    // Check permission
    const hasPermission = await rbacService.hasPermission({
      userId,
      action: 'execute-runbook',
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const result = await blueGreenDeploy.shiftTraffic(
      provider,
      serviceName,
      greenEnvironmentId,
      parseInt(percentage)
    );

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Traffic shift error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/runbooks/bluegreen/:serviceName/rollback
 * Manual rollback
 */
router.post('/bluegreen/:serviceName/rollback', isAuthenticated, async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { provider, greenEnvironmentId, blueEnvironment } = req.body;
    const userId = getUserId(req);

    // Check permission (admin only)
    const isAdmin = await rbacService.hasRole(userId, 'admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only administrators can trigger manual rollbacks' });
    }

    await blueGreenDeploy.rollbackDeployment(
      provider,
      serviceName,
      greenEnvironmentId,
      blueEnvironment
    );

    res.json({
      success: true,
      message: 'Rollback completed',
    });
  } catch (error: any) {
    console.error('Rollback error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/runbooks/bluegreen/:executionId/audit
 * Download deployment audit report (PDF or JSON)
 */
router.get('/bluegreen/:executionId/audit', isAuthenticated, async (req, res) => {
  try {
    const { executionId } = req.params;
    const { format = 'pdf' } = req.query;
    const userId = getUserId(req);

    // Check permission
    const hasPermission = await rbacService.hasPermission({
      userId,
      action: 'export-audit-logs',
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to export audit logs' });
    }

    const report = await auditService.generateExecutionReport(
      executionId,
      format as 'pdf' | 'json'
    );

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="deployment-audit-${executionId}.pdf"`
      );
      res.send(report);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="deployment-audit-${executionId}.json"`
      );
      res.send(report);
    }
  } catch (error: any) {
    console.error('Audit export error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

