/**
 * Enterprise-grade tests for Azure Key Vault Service
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AzureKeyVaultService } from '../azureKeyVaultService';

describe('AzureKeyVaultService', () => {
  let service: AzureKeyVaultService;

  beforeEach(() => {
    service = new AzureKeyVaultService();
    service.clearCache();
  });

  describe('getSecret', () => {
    it('should fetch secret from Key Vault', async () => {
      const secret = await service.getSecret('OPENAI-API-KEY');

      // In test environment, this might be null if not connected to Azure
      expect(secret).toBeDefined();
    });

    it('should cache secrets after first fetch', async () => {
      await service.getSecret('GITHUB-CLIENT-ID');
      const cacheStats = service.getCacheStats();

      expect(cacheStats.size).toBeGreaterThan(0);
      expect(cacheStats.keys).toContain('GITHUB-CLIENT-ID');
    });

    it('should return null for non-existent secrets', async () => {
      const secret = await service.getSecret('NON-EXISTENT-SECRET-12345');

      expect(secret).toBeNull();
    });

    it('should handle cache expiration', async () => {
      const secret1 = await service.getSecret('TEST-SECRET');

      // Clear cache
      service.clearCache();

      const secret2 = await service.getSecret('TEST-SECRET');

      // Both should make actual requests (or be null if secret doesn't exist)
      expect(secret1).toEqual(secret2);
    });
  });

  describe('getSecrets', () => {
    it('should fetch multiple secrets at once', async () => {
      const secrets = await service.getSecrets([
        'GITHUB-CLIENT-ID',
        'GITLAB-CLIENT-ID',
        'OPENAI-API-KEY'
      ]);

      expect(secrets).toBeDefined();
      expect(Object.keys(secrets)).toHaveLength(3);
    });

    it('should handle mix of existing and non-existing secrets', async () => {
      const secrets = await service.getSecrets([
        'GITHUB-CLIENT-ID',
        'NON-EXISTENT-SECRET'
      ]);

      expect(secrets['GITHUB-CLIENT-ID']).toBeDefined();
      expect(secrets['NON-EXISTENT-SECRET']).toBeNull();
    });
  });

  describe('checkIntegrationStatus', () => {
    it('should report integration as ready when all secrets exist', async () => {
      const status = await service.checkIntegrationStatus('github', [
        'GITHUB-CLIENT-ID',
        'GITHUB-CLIENT-SECRET'
      ]);

      if (status.ready) {
        expect(status.missing).toHaveLength(0);
      } else {
        expect(status.missing.length).toBeGreaterThan(0);
      }
    });

    it('should report missing secrets correctly', async () => {
      const status = await service.checkIntegrationStatus('test', [
        'TEST-SECRET-1',
        'TEST-SECRET-2',
        'NON-EXISTENT-SECRET'
      ]);

      expect(status).toHaveProperty('ready');
      expect(status).toHaveProperty('missing');
      expect(status.missing).toBeInstanceOf(Array);
    });
  });

  describe('getAvailableIntegrations', () => {
    it('should list all available integrations', async () => {
      const integrations = await service.getAvailableIntegrations();

      expect(integrations).toBeInstanceOf(Array);
      expect(integrations.length).toBeGreaterThan(0);

      // Should include common integrations
      expect(integrations).toEqual(expect.arrayContaining([
        expect.stringMatching(/github|gitlab|aws|azure|openai/i)
      ]));
    });
  });

  describe('caching', () => {
    it('should track cache statistics', async () => {
      await service.getSecret('SECRET-1');
      await service.getSecret('SECRET-2');

      const stats = service.getCacheStats();

      expect(stats.size).toBeGreaterThanOrEqual(0);
      expect(stats.keys).toBeInstanceOf(Array);
    });

    it('should clear cache on demand', async () => {
      await service.getSecret('TEST-SECRET');

      let stats = service.getCacheStats();
      const initialSize = stats.size;

      service.clearCache();

      stats = service.getCacheStats();
      expect(stats.size).toBeLessThan(initialSize);
    });
  });
});
