/**
 * AUTONOMOUS HEALTH MONITORING AGENT
 * Continuously monitors deployed apps and auto-restarts on failure
 */

import fetch from "node-fetch";
import { storage } from "../storage";
import { azureContainerApps } from "./azureContainerApps";

interface MonitoredApp {
  deploymentId: string;
  projectId: string;
  url: string;
  containerAppName: string;
  healthCheckInterval: number; // seconds
  failureThreshold: number;
  consecutiveFailures: number;
  lastCheck: Date;
  lastSuccess: Date;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'down';
}

export class HealthMonitorAgent {
  private monitoredApps: Map<string, MonitoredApp> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor() {
    console.log('🏥 Health Monitor Agent initialized');
  }

  /**
   * Start monitoring all active deployments
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Health Monitor already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Health Monitor Agent starting...');

    // Load all active deployments from database
    await this.loadActiveDeployments();

    // Start monitoring loop for each app
    for (const [deploymentId, app] of this.monitoredApps) {
      this.startMonitoring(deploymentId);
    }

    console.log(`✅ Health Monitor Agent started - monitoring ${this.monitoredApps.size} apps`);
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('🛑 Stopping Health Monitor Agent...');
    this.isRunning = false;

    // Clear all intervals
    for (const [deploymentId, interval] of this.monitoringIntervals) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();

    console.log('✅ Health Monitor Agent stopped');
  }

  /**
   * Add a new deployment to monitor
   */
  async addDeployment(deployment: {
    deploymentId: string;
    projectId: string;
    url: string;
    containerAppName: string;
  }) {
    console.log(`➕ Adding deployment to monitor: ${deployment.deploymentId}`);

    const monitoredApp: MonitoredApp = {
      deploymentId: deployment.deploymentId,
      projectId: deployment.projectId,
      url: deployment.url,
      containerAppName: deployment.containerAppName,
      healthCheckInterval: 30, // 30 seconds
      failureThreshold: 3,
      consecutiveFailures: 0,
      lastCheck: new Date(),
      lastSuccess: new Date(),
      status: 'healthy'
    };

    this.monitoredApps.set(deployment.deploymentId, monitoredApp);

    // Start monitoring if agent is running
    if (this.isRunning) {
      this.startMonitoring(deployment.deploymentId);
    }

    console.log(`✅ Now monitoring: ${deployment.url}`);
  }

  /**
   * Remove deployment from monitoring
   */
  removeDeployment(deploymentId: string) {
    console.log(`➖ Removing deployment from monitor: ${deploymentId}`);

    const interval = this.monitoringIntervals.get(deploymentId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(deploymentId);
    }

    this.monitoredApps.delete(deploymentId);
  }

  /**
   * Load active deployments from database
   */
  private async loadActiveDeployments() {
    try {
      // Get all deployments with status 'deployed' or 'healthy'
      const deployments = await storage.getActiveDeployments?.() || [];

      console.log(`📋 Found ${deployments.length} active deployments to monitor`);

      for (const deployment of deployments) {
        if (deployment.deploymentUrl && deployment.containerAppName) {
          const monitoredApp: MonitoredApp = {
            deploymentId: deployment.id,
            projectId: deployment.projectId,
            url: deployment.deploymentUrl,
            containerAppName: deployment.containerAppName,
            healthCheckInterval: 30,
            failureThreshold: 3,
            consecutiveFailures: 0,
            lastCheck: new Date(),
            lastSuccess: deployment.lastHealthCheck || new Date(),
            status: deployment.healthStatus || 'healthy'
          };

          this.monitoredApps.set(deployment.id, monitoredApp);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load active deployments:', error);
    }
  }

  /**
   * Start monitoring a specific deployment
   */
  private startMonitoring(deploymentId: string) {
    const app = this.monitoredApps.get(deploymentId);
    if (!app) return;

    // Clear existing interval if any
    const existingInterval = this.monitoringIntervals.get(deploymentId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Start new monitoring interval
    const interval = setInterval(async () => {
      await this.performHealthCheck(deploymentId);
    }, app.healthCheckInterval * 1000);

    this.monitoringIntervals.set(deploymentId, interval);

    // Perform immediate health check
    this.performHealthCheck(deploymentId);
  }

  /**
   * Perform health check on a deployment
   */
  private async performHealthCheck(deploymentId: string) {
    const app = this.monitoredApps.get(deploymentId);
    if (!app) return;

    const startTime = Date.now();
    app.lastCheck = new Date();

    try {
      // Try root endpoint first
      let response = await fetch(app.url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Careerate-HealthMonitor/1.0'
        }
      });

      // If root fails, try /health endpoint
      if (!response.ok) {
        response = await fetch(`${app.url}/health`, {
          timeout: 10000
        });
      }

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        // Health check passed
        await this.handleHealthCheckSuccess(app, responseTime);
      } else {
        // Health check failed (non-200 response)
        await this.handleHealthCheckFailure(app, `HTTP ${response.status}`, responseTime);
      }

    } catch (error) {
      // Health check failed (network error, timeout, etc.)
      const responseTime = Date.now() - startTime;
      await this.handleHealthCheckFailure(
        app,
        error instanceof Error ? error.message : 'Unknown error',
        responseTime
      );
    }
  }

  /**
   * Handle successful health check
   */
  private async handleHealthCheckSuccess(app: MonitoredApp, responseTime: number) {
    const wasUnhealthy = app.status !== 'healthy';

    app.consecutiveFailures = 0;
    app.lastSuccess = new Date();
    app.status = 'healthy';

    // Update database
    await storage.updateHealthCheck(app.deploymentId, {
      status: 'healthy',
      lastCheck: app.lastCheck,
      lastSuccessful: app.lastSuccess,
      responseTime,
      failureCount: 0,
      errorMessage: null
    });

    await storage.updateDeployment(app.deploymentId, {
      healthStatus: 'healthy',
      lastHealthCheck: app.lastCheck
    });

    if (wasUnhealthy) {
      console.log(`💚 ${app.url} is now HEALTHY (recovered)`);
      await this.logIncident(app, 'recovery', 'Application recovered and is now healthy');
    }
  }

  /**
   * Handle failed health check
   */
  private async handleHealthCheckFailure(app: MonitoredApp, errorMessage: string, responseTime: number) {
    app.consecutiveFailures++;

    // Determine status based on consecutive failures
    if (app.consecutiveFailures >= app.failureThreshold) {
      app.status = 'down';
    } else if (app.consecutiveFailures >= 2) {
      app.status = 'degraded';
    } else {
      app.status = 'unhealthy';
    }

    console.log(`❌ Health check failed for ${app.url}: ${errorMessage} (${app.consecutiveFailures}/${app.failureThreshold})`);

    // Update database
    await storage.updateHealthCheck(app.deploymentId, {
      status: app.status,
      lastCheck: app.lastCheck,
      responseTime,
      failureCount: app.consecutiveFailures,
      errorMessage
    });

    await storage.updateDeployment(app.deploymentId, {
      healthStatus: app.status,
      lastHealthCheck: app.lastCheck,
      errorLogs: errorMessage
    });

    // Take action if threshold reached
    if (app.consecutiveFailures >= app.failureThreshold) {
      await this.handleCriticalFailure(app, errorMessage);
    }
  }

  /**
   * Handle critical failure - attempt auto-restart
   */
  private async handleCriticalFailure(app: MonitoredApp, errorMessage: string) {
    console.log(`🚨 CRITICAL: ${app.url} is DOWN - attempting auto-restart`);

    try {
      // Log incident
      await this.logIncident(app, 'critical_failure', errorMessage);

      // Attempt to restart the container app
      console.log(`🔄 Restarting ${app.containerAppName}...`);
      await azureContainerApps.restartApp(app.containerAppName);

      // Reset failure count after restart
      app.consecutiveFailures = 0;
      app.status = 'healthy';

      console.log(`✅ Successfully restarted ${app.containerAppName}`);

      await this.logIncident(app, 'auto_restart', 'Application automatically restarted due to health check failures');

      // Update deployment status
      await storage.updateDeployment(app.deploymentId, {
        status: 'deployed',
        healthStatus: 'healthy'
      });

    } catch (error) {
      console.error(`❌ Failed to restart ${app.containerAppName}:`, error);

      await this.logIncident(
        app,
        'restart_failed',
        `Auto-restart failed: ${error instanceof Error ? error.message : String(error)}`
      );

      // Mark as failed in database
      await storage.updateDeployment(app.deploymentId, {
        status: 'failed',
        healthStatus: 'down',
        errorLogs: `Auto-restart failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  /**
   * Log incident to database
   */
  private async logIncident(app: MonitoredApp, type: string, message: string) {
    try {
      await storage.createIncident?.({
        projectId: app.projectId,
        deploymentId: app.deploymentId,
        severity: type === 'critical_failure' ? 'critical' : type === 'recovery' ? 'info' : 'warning',
        title: `Health Check ${type.replace('_', ' ').toUpperCase()}`,
        description: message,
        status: type === 'recovery' ? 'resolved' : 'detected',
        detectedAt: new Date(),
        resolvedAt: type === 'recovery' ? new Date() : undefined
      });
    } catch (error) {
      console.error('Failed to log incident:', error);
    }
  }

  /**
   * Get current monitoring status
   */
  getStatus() {
    const apps = Array.from(this.monitoredApps.values());

    return {
      isRunning: this.isRunning,
      totalApps: apps.length,
      healthy: apps.filter(a => a.status === 'healthy').length,
      degraded: apps.filter(a => a.status === 'degraded').length,
      unhealthy: apps.filter(a => a.status === 'unhealthy').length,
      down: apps.filter(a => a.status === 'down').length,
      apps: apps.map(a => ({
        deploymentId: a.deploymentId,
        url: a.url,
        status: a.status,
        consecutiveFailures: a.consecutiveFailures,
        lastCheck: a.lastCheck,
        lastSuccess: a.lastSuccess
      }))
    };
  }
}

// Singleton instance - starts automatically
export const healthMonitor = new HealthMonitorAgent();

// Auto-start on module load
healthMonitor.start().catch(error => {
  console.error('❌ Failed to start Health Monitor Agent:', error);
});