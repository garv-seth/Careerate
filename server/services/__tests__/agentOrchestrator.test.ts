/**
 * Enterprise-grade tests for Agent Orchestrator
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { agentOrchestrator } from '../agentOrchestrator';
import { storage } from '../../storage';

// Mock dependencies
jest.mock('../../storage');
jest.mock('../azureKeyVaultService');

describe('AgentOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseIntent', () => {
    it('should parse Node.js deployment intent correctly', async () => {
      const intent = {
        projectId: 'test-project-123',
        userId: 'user-456',
        naturalLanguageInput: 'Deploy my Node.js app to AWS with auto-scaling',
        context: {
          repositoryUrl: 'https://github.com/user/repo',
          framework: 'express'
        }
      };

      const plan = await agentOrchestrator.parseIntent(intent);

      expect(plan).toBeDefined();
      expect(plan.provider).toBe('aws');
      expect(plan.planId).toMatch(/^plan-\d+-[a-z0-9]+$/);
      expect(plan.steps).toBeInstanceOf(Array);
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.reasoning).toBeTruthy();
    });

    it('should recommend appropriate provider based on workload', async () => {
      const intent = {
        projectId: 'test-project-123',
        userId: 'user-456',
        naturalLanguageInput: 'Deploy a Next.js frontend app',
        context: {
          framework: 'next'
        }
      };

      const plan = await agentOrchestrator.parseIntent(intent);

      // Next.js should recommend Vercel
      expect(['vercel', 'azure']).toContain(plan.provider);
    });

    it('should include cost estimates in plan', async () => {
      const intent = {
        projectId: 'test-project-123',
        userId: 'user-456',
        naturalLanguageInput: 'Deploy to the cheapest provider',
        context: {}
      };

      const plan = await agentOrchestrator.parseIntent(intent);

      expect(plan.costEstimate).toBeDefined();
      expect(plan.costEstimate.monthly).toBeGreaterThan(0);
      expect(plan.costEstimate.breakdown).toBeDefined();
    });

    it('should include security checks', async () => {
      const intent = {
        projectId: 'test-project-123',
        userId: 'user-456',
        naturalLanguageInput: 'Deploy securely',
        context: {}
      };

      const plan = await agentOrchestrator.parseIntent(intent);

      expect(plan.securityChecks).toBeInstanceOf(Array);
      expect(plan.securityChecks.length).toBeGreaterThan(0);
    });

    it('should handle invalid input gracefully', async () => {
      const intent = {
        projectId: '',
        userId: '',
        naturalLanguageInput: '',
        context: {}
      };

      await expect(agentOrchestrator.parseIntent(intent)).rejects.toThrow();
    });
  });

  describe('executePlan', () => {
    it('should execute approved plan successfully', async () => {
      const mockPlan = {
        id: 'plan-123',
        status: 'approved',
        provider: 'azure',
        steps: ['Build Docker image', 'Push to registry', 'Deploy to Azure'],
        projectId: 'test-project-123'
      };

      (storage.getDeploymentPlan as jest.Mock).mockResolvedValue(mockPlan);
      (storage.createDeployment as jest.Mock).mockResolvedValue({ id: 'deployment-123' });

      const progressSteps: string[] = [];
      const result = await agentOrchestrator.executePlan('plan-123', (step, progress) => {
        progressSteps.push(step);
      });

      expect(result.success).toBe(true);
      expect(result.deploymentId).toBeTruthy();
      expect(progressSteps.length).toBeGreaterThan(0);
    });

    it('should reject execution of unapproved plan', async () => {
      const mockPlan = {
        id: 'plan-123',
        status: 'pending_approval',
        provider: 'azure',
        steps: [],
        projectId: 'test-project-123'
      };

      (storage.getDeploymentPlan as jest.Mock).mockResolvedValue(mockPlan);

      await expect(agentOrchestrator.executePlan('plan-123')).rejects.toThrow('must be approved');
    });

    it('should handle execution errors gracefully', async () => {
      const mockPlan = {
        id: 'plan-123',
        status: 'approved',
        provider: 'aws',
        steps: ['Failing step'],
        projectId: 'test-project-123'
      };

      (storage.getDeploymentPlan as jest.Mock).mockResolvedValue(mockPlan);
      (storage.createDeployment as jest.Mock).mockRejectedValue(new Error('Deployment failed'));

      const result = await agentOrchestrator.executePlan('plan-123');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getCapabilities', () => {
    it('should return all registered capabilities', () => {
      const capabilities = agentOrchestrator.getCapabilities();

      expect(capabilities).toBeInstanceOf(Array);
      expect(capabilities.length).toBeGreaterThan(0);

      const deployAWS = capabilities.find(c => c.name === 'Deploy to AWS');
      expect(deployAWS).toBeDefined();
      expect(deployAWS?.requiresAuth).toBe(true);
      expect(deployAWS?.provider).toBe('aws');
    });
  });

  describe('canPerformAction', () => {
    it('should allow action when user has connected provider', async () => {
      (storage.getUserIntegrations as jest.Mock).mockResolvedValue([
        { service: 'aws', status: 'active' }
      ]);

      const canDeploy = await agentOrchestrator.canPerformAction('deploy_aws', 'user-123');

      expect(canDeploy).toBe(true);
    });

    it('should deny action when user has not connected provider', async () => {
      (storage.getUserIntegrations as jest.Mock).mockResolvedValue([]);

      const canDeploy = await agentOrchestrator.canPerformAction('deploy_aws', 'user-123');

      expect(canDeploy).toBe(false);
    });

    it('should allow actions that do not require auth', async () => {
      const canConfigure = await agentOrchestrator.canPerformAction('configure_autoscaling', 'user-123');

      expect(canConfigure).toBe(true);
    });
  });
});
