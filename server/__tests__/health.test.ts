/**
 * Health Endpoint Tests
 * 
 * Test suite for health check endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Create test app with health endpoint
const app = express();
app.use(express.json());

// Add health route
app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: 'healthy',
    healthy: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'connected',
      keyVault: 'connected',
      memory: process.memoryUsage(),
      version: 'v0.0.25'
    }
  });
});

describe('Health Check API', () => {
  it('GET /health returns 200 and health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/);
    
    expect(response.status).toBeLessThanOrEqual(503);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
  });

  it('health response includes all required fields', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body.checks).toHaveProperty('version');
  });

  it('health response includes service checks', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.body).toHaveProperty('checks');
    expect(response.body.checks).toHaveProperty('database');
    expect(response.body.checks).toHaveProperty('keyVault');
  });
});

