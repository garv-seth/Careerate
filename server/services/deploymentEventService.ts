import { sseService } from './sseService.js';
import { db } from '../db.js';
import { deployments } from '@shared/schema';
import { eq } from 'drizzle-orm';

export type DeploymentEventType =
  | 'deployment.created'
  | 'deployment.building'
  | 'deployment.pushing'
  | 'deployment.deploying'
  | 'deployment.deployed'
  | 'deployment.failed'
  | 'deployment.log'
  | 'deployment.health_check'
  | 'deployment.rollback_started'
  | 'deployment.rollback_completed';

export interface DeploymentEvent {
  type: DeploymentEventType;
  deploymentId: string;
  projectId: string;
  message?: string;
  progress?: number;
  url?: string;
  logs?: string;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

class DeploymentEventService {
  /**
   * Emit deployment event and broadcast via SSE
   */
  async emit(event: DeploymentEvent): Promise<void> {
    const { deploymentId, type, message, progress, logs, error, url, metadata } = event;

    console.log(`[DeploymentEvent] ${type} - ${deploymentId}: ${message || ''}`);

    // Update deployment in database based on event type
    try {
      const updateData: any = {
        updatedAt: new Date()
      };

      switch (type) {
        case 'deployment.building':
          updateData.status = 'building';
          if (progress !== undefined) updateData.buildProgress = progress;
          if (logs) updateData.buildLogs = logs;
          break;

        case 'deployment.pushing':
          updateData.status = 'pushing';
          if (logs) updateData.buildLogs = logs;
          break;

        case 'deployment.deploying':
          updateData.status = 'deploying';
          if (progress !== undefined) updateData.deployProgress = progress;
          break;

        case 'deployment.deployed':
          updateData.status = 'deployed';
          updateData.deployProgress = 100;
          if (url) updateData.deploymentUrl = url;
          if (logs) updateData.deploymentLogs = logs;
          break;

        case 'deployment.failed':
          updateData.status = 'failed';
          if (error) updateData.errorLogs = error;
          break;

        case 'deployment.log':
          // Append to appropriate log field
          if (updateData.status === 'building' || updateData.status === 'pushing') {
            const current = await db.query.deployments.findFirst({
              where: eq(deployments.id, deploymentId)
            });
            updateData.buildLogs = (current?.buildLogs || '') + '\n' + logs;
          } else {
            const current = await db.query.deployments.findFirst({
              where: eq(deployments.id, deploymentId)
            });
            updateData.deploymentLogs = (current?.deploymentLogs || '') + '\n' + logs;
          }
          break;
      }

      // Update database
      await db.update(deployments)
        .set(updateData)
        .where(eq(deployments.id, deploymentId));

    } catch (dbError) {
      console.error('[DeploymentEvent] Database update error:', dbError);
    }

    // Broadcast to all listening clients
    sseService.broadcastDeployment(deploymentId, {
      type,
      deploymentId,
      projectId: event.projectId,
      message,
      progress,
      url,
      logs,
      error,
      metadata,
      timestamp: event.timestamp
    });

    // Also broadcast to project channel
    sseService.broadcastProject(event.projectId, {
      type: 'project.deployment_update',
      deploymentId,
      deploymentEvent: type,
      message,
      timestamp: event.timestamp
    });
  }

  /**
   * Emit log entry
   */
  async log(deploymentId: string, projectId: string, logMessage: string): Promise<void> {
    await this.emit({
      type: 'deployment.log',
      deploymentId,
      projectId,
      logs: logMessage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit progress update
   */
  async progress(
    deploymentId: string,
    projectId: string,
    type: DeploymentEventType,
    progress: number,
    message?: string
  ): Promise<void> {
    await this.emit({
      type,
      deploymentId,
      projectId,
      progress,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

export const deploymentEventService = new DeploymentEventService();
