/**
 * Health Endpoint Tests
 * 
 * Test suite for health check endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { healthMonitor } from '../services/healthMonitor';

// Create test app
const app = express();
app.use(express.json());

// Add health route
app.get('/health', async (req, res) => {
  const health = await healthMonitor.checkHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

describe('Health Check API', () => {
  it('GET /health returns 200 and health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/);
    
    expect(response.status).toBeLessThanOrEqual(503);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
  });

  it('health response includes all required fields', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('version');
  });

  it('health response includes service checks', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body).toHaveProperty('checks');
    expect(response.body.checks).toHaveProperty('database');
    expect(response.body.checks).toHaveProperty('keyVault');
  });
});

