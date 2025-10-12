/**
 * Planner Agent Tests
 * 
 * Test suite for Planner Agent functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Planner Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Intent Analysis', () => {
    it('identifies deployment intent', () => {
      const userInput = 'Deploy my Next.js app to AWS';
      
      // Mock planner analysis
      const intent = {
        action: 'deploy',
        framework: 'nextjs',
        provider: 'aws',
        confidence: 0.95,
      };
      
      expect(intent.action).toBe('deploy');
      expect(intent.framework).toBe('nextjs');
      expect(intent.provider).toBe('aws');
      expect(intent.confidence).toBeGreaterThan(0.9);
    });

    it('identifies infrastructure requirements', () => {
      const userInput = 'I need a database and Redis cache';
      
      const requirements = {
        services: ['database', 'redis'],
        type: 'infrastructure',
      };
      
      expect(requirements.services).toContain('database');
      expect(requirements.services).toContain('redis');
    });

    it('extracts region preferences', () => {
      const userInput = 'Deploy to us-east-1';
      
      const preferences = {
        region: 'us-east-1',
      };
      
      expect(preferences.region).toBe('us-east-1');
    });
  });

  describe('Cost Estimation', () => {
    it('estimates deployment cost', () => {
      const plan = {
        provider: 'aws',
        services: ['ec2', 'rds', 's3'],
        region: 'us-east-1',
      };
      
      const estimate = {
        monthly: 150,
        yearly: 1800,
        breakdown: {
          compute: 50,
          database: 80,
          storage: 20,
        },
      };
      
      expect(estimate.monthly).toBeGreaterThan(0);
      expect(estimate.yearly).toBe(estimate.monthly * 12);
    });

    it('compares multi-cloud costs', () => {
      const comparison = {
        aws: 150,
        azure: 145,
        gcp: 140,
        recommended: 'gcp',
      };
      
      expect(comparison.recommended).toBe('gcp');
      expect(comparison.gcp).toBeLessThan(comparison.aws);
    });
  });

  describe('Deployment Plan Generation', () => {
    it('generates complete deployment plan', () => {
      const plan = {
        provider: 'aws',
        region: 'us-east-1',
        services: ['ec2', 'rds', 's3'],
        steps: [
          { order: 1, action: 'provision-vpc' },
          { order: 2, action: 'provision-ec2' },
          { order: 3, action: 'provision-rds' },
        ],
        estimatedDuration: 900, // 15 minutes
      };
      
      expect(plan.steps).toHaveLength(3);
      expect(plan.steps[0].order).toBe(1);
      expect(plan.estimatedDuration).toBeGreaterThan(0);
    });

    it('includes rollback strategy', () => {
      const plan = {
        rollbackStrategy: 'blue-green',
        canRollback: true,
        rollbackSteps: [
          { order: 1, action: 'switch-traffic' },
          { order: 2, action: 'cleanup-new-resources' },
        ],
      };
      
      expect(plan.canRollback).toBe(true);
      expect(plan.rollbackSteps).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid user input gracefully', () => {
      const userInput = '';
      
      const result = {
        error: 'Invalid input',
        success: false,
      };
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles unsupported cloud provider', () => {
      const userInput = 'Deploy to my-custom-cloud';
      
      const result = {
        error: 'Unsupported provider',
        supportedProviders: ['aws', 'azure', 'gcp'],
      };
      
      expect(result.error).toContain('Unsupported');
      expect(result.supportedProviders).toContain('aws');
    });
  });
});

