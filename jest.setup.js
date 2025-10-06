// Jest setup file for global test configuration

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.AZURE_KEY_VAULT_NAME = 'CareeerateSecretsVault';

// Global test timeout
jest.setTimeout(30000);

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
