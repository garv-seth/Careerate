/**
 * Storage Service Extensions for V2.0
 * 
 * Methods for new tables: agent_sessions, deployment_plans, agent_actions,
 * cloud_connections, ejection_exports, autonomy_settings, cost_alerts
 */

import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import {
  agentSessions,
  deploymentPlans,
  agentActions,
  cloudConnections,
  ejectionExports,
  autonomySettings,
  costAlerts,
  type AgentSession,
  type InsertAgentSession,
  type DeploymentPlan,
  type InsertDeploymentPlan,
  type AgentAction,
  type InsertAgentAction,
  type CloudConnection,
  type InsertCloudConnection,
  type EjectionExport,
  type InsertEjectionExport,
  type AutonomySettings,
  type InsertAutonomySettings,
  type CostAlert,
  type InsertCostAlert,
} from "@shared/schema-v2";

// ============================================================================
// AGENT SESSIONS
// ============================================================================

export async function createAgentSession(data: InsertAgentSession): Promise<AgentSession> {
  const [session] = await db.insert(agentSessions).values(data).returning();
  return session;
}

export async function getAgentSession(id: string): Promise<AgentSession | null> {
  const [session] = await db.select().from(agentSessions).where(eq(agentSessions.id, id));
  return session || null;
}

export async function getUserAgentSessions(userId: string, limit = 50): Promise<AgentSession[]> {
  return db
    .select()
    .from(agentSessions)
    .where(eq(agentSessions.userId, userId))
    .orderBy(desc(agentSessions.createdAt))
    .limit(limit);
}

export async function updateAgentSession(
  id: string,
  data: Partial<Omit<AgentSession, 'id' | 'createdAt'>>
): Promise<AgentSession> {
  const [updated] = await db
    .update(agentSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agentSessions.id, id))
    .returning();
  return updated;
}

export async function completeAgentSession(id: string): Promise<AgentSession> {
  return updateAgentSession(id, {
    status: 'completed',
    completedAt: new Date()
  });
}

// ============================================================================
// DEPLOYMENT PLANS
// ============================================================================

export async function createDeploymentPlan(data: InsertDeploymentPlan): Promise<DeploymentPlan> {
  const [plan] = await db.insert(deploymentPlans).values(data).returning();
  return plan;
}

export async function getDeploymentPlan(id: string): Promise<DeploymentPlan | null> {
  const [plan] = await db.select().from(deploymentPlans).where(eq(deploymentPlans.id, id));
  return plan || null;
}

export async function getUserDeploymentPlans(userId: string, limit = 50): Promise<DeploymentPlan[]> {
  return db
    .select()
    .from(deploymentPlans)
    .where(eq(deploymentPlans.userId, userId))
    .orderBy(desc(deploymentPlans.createdAt))
    .limit(limit);
}

export async function getPendingDeploymentPlans(userId: string): Promise<DeploymentPlan[]> {
  return db
    .select()
    .from(deploymentPlans)
    .where(and(
      eq(deploymentPlans.userId, userId),
      eq(deploymentPlans.status, 'pending')
    ))
    .orderBy(desc(deploymentPlans.createdAt));
}

export async function updateDeploymentPlan(
  id: string,
  data: Partial<Omit<DeploymentPlan, 'id' | 'createdAt'>>
): Promise<DeploymentPlan> {
  const [updated] = await db
    .update(deploymentPlans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(deploymentPlans.id, id))
    .returning();
  return updated;
}

export async function approveDeploymentPlan(
  id: string,
  approvedBy: string
): Promise<DeploymentPlan> {
  return updateDeploymentPlan(id, {
    status: 'approved',
    approvedAt: new Date(),
    approvedBy
  });
}

export async function rejectDeploymentPlan(
  id: string,
  rejectedBy: string,
  reason: string
): Promise<DeploymentPlan> {
  return updateDeploymentPlan(id, {
    status: 'rejected',
    rejectedAt: new Date(),
    rejectedBy,
    rejectionReason: reason
  });
}

// ============================================================================
// AGENT ACTIONS
// ============================================================================

export async function createAgentAction(data: InsertAgentAction): Promise<AgentAction> {
  const [action] = await db.insert(agentActions).values(data).returning();
  return action;
}

export async function getAgentAction(id: string): Promise<AgentAction | null> {
  const [action] = await db.select().from(agentActions).where(eq(agentActions.id, id));
  return action || null;
}

export async function getUserAgentActions(
  userId: string,
  filters?: {
    actionType?: string;
    status?: string;
    limit?: number;
  }
): Promise<AgentAction[]> {
  let query = db
    .select()
    .from(agentActions)
    .where(eq(agentActions.userId, userId))
    .orderBy(desc(agentActions.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const actions = await query;

  // Apply additional filters in memory (could optimize with SQL)
  let filtered = actions;
  if (filters?.actionType) {
    filtered = filtered.filter(a => a.actionType === filters.actionType);
  }
  if (filters?.status) {
    filtered = filtered.filter(a => a.status === filters.status);
  }

  return filtered;
}

export async function getSessionAgentActions(sessionId: string): Promise<AgentAction[]> {
  return db
    .select()
    .from(agentActions)
    .where(eq(agentActions.agentSessionId, sessionId))
    .orderBy(desc(agentActions.createdAt));
}

export async function updateAgentAction(
  id: string,
  data: Partial<Omit<AgentAction, 'id' | 'createdAt'>>
): Promise<AgentAction> {
  const [updated] = await db
    .update(agentActions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agentActions.id, id))
    .returning();
  return updated;
}

export async function approveAgentAction(
  id: string,
  approvedBy: string
): Promise<AgentAction> {
  return updateAgentAction(id, {
    approved: true,
    approvedBy,
    approvedAt: new Date(),
    status: 'executing'
  });
}

// ============================================================================
// CLOUD CONNECTIONS
// ============================================================================

export async function createCloudConnection(data: InsertCloudConnection): Promise<CloudConnection> {
  const [connection] = await db.insert(cloudConnections).values(data).returning();
  return connection;
}

export async function getCloudConnection(id: string): Promise<CloudConnection | null> {
  const [connection] = await db.select().from(cloudConnections).where(eq(cloudConnections.id, id));
  return connection || null;
}

export async function getUserCloudConnections(userId: string): Promise<CloudConnection[]> {
  return db
    .select()
    .from(cloudConnections)
    .where(eq(cloudConnections.userId, userId))
    .orderBy(desc(cloudConnections.connectedAt));
}

export async function getUserCloudConnectionByProvider(
  userId: string,
  provider: 'aws' | 'azure' | 'gcp'
): Promise<CloudConnection | null> {
  const [connection] = await db
    .select()
    .from(cloudConnections)
    .where(and(
      eq(cloudConnections.userId, userId),
      eq(cloudConnections.provider, provider)
    ));
  return connection || null;
}

export async function updateCloudConnection(
  id: string,
  data: Partial<Omit<CloudConnection, 'id' | 'createdAt'>>
): Promise<CloudConnection> {
  const [updated] = await db
    .update(cloudConnections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cloudConnections.id, id))
    .returning();
  return updated;
}

export async function ejectCloudConnection(
  id: string,
  ejectedBy: string
): Promise<CloudConnection> {
  return updateCloudConnection(id, {
    status: 'ejected',
    ejectedAt: new Date(),
    ejectedBy
  });
}

export async function deleteCloudConnection(id: string): Promise<void> {
  await db.delete(cloudConnections).where(eq(cloudConnections.id, id));
}

// ============================================================================
// EJECTION EXPORTS
// ============================================================================

export async function createEjectionExport(data: InsertEjectionExport): Promise<EjectionExport> {
  const [exportRecord] = await db.insert(ejectionExports).values(data).returning();
  return exportRecord;
}

export async function getEjectionExport(id: string): Promise<EjectionExport | null> {
  const [exportRecord] = await db.select().from(ejectionExports).where(eq(ejectionExports.id, id));
  return exportRecord || null;
}

export async function getUserEjectionExports(userId: string): Promise<EjectionExport[]> {
  return db
    .select()
    .from(ejectionExports)
    .where(eq(ejectionExports.userId, userId))
    .orderBy(desc(ejectionExports.createdAt));
}

export async function updateEjectionExport(
  id: string,
  data: Partial<Omit<EjectionExport, 'id' | 'createdAt'>>
): Promise<EjectionExport> {
  const [updated] = await db
    .update(ejectionExports)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ejectionExports.id, id))
    .returning();
  return updated;
}

export async function trackEjectionExportDownload(id: string): Promise<EjectionExport> {
  const exportRecord = await getEjectionExport(id);
  if (!exportRecord) {
    throw new Error('Ejection export not found');
  }

  return updateEjectionExport(id, {
    downloadCount: exportRecord.downloadCount + 1,
    lastDownloadedAt: new Date()
  });
}

// ============================================================================
// AUTONOMY SETTINGS
// ============================================================================

export async function createAutonomySettings(data: InsertAutonomySettings): Promise<AutonomySettings> {
  const [settings] = await db.insert(autonomySettings).values(data).returning();
  return settings;
}

export async function getUserAutonomySettings(userId: string): Promise<AutonomySettings | null> {
  const [settings] = await db
    .select()
    .from(autonomySettings)
    .where(eq(autonomySettings.userId, userId));
  return settings || null;
}

export async function upsertAutonomySettings(
  userId: string,
  data: Omit<InsertAutonomySettings, 'userId'>
): Promise<AutonomySettings> {
  const existing = await getUserAutonomySettings(userId);

  if (existing) {
    const [updated] = await db
      .update(autonomySettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(autonomySettings.userId, userId))
      .returning();
    return updated;
  } else {
    return createAutonomySettings({ ...data, userId });
  }
}

export async function acceptAutonomyDisclaimer(
  userId: string,
  disclaimerVersion: string,
  riskAcknowledgement: string
): Promise<AutonomySettings> {
  const existing = await getUserAutonomySettings(userId);

  const data = {
    disclaimerAccepted: true,
    disclaimerAcceptedAt: new Date(),
    disclaimerVersion,
    riskAcknowledgement
  };

  if (existing) {
    const [updated] = await db
      .update(autonomySettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(autonomySettings.userId, userId))
      .returning();
    return updated;
  } else {
    return createAutonomySettings({
      userId,
      level: 'supervised',
      ...data
    });
  }
}

// ============================================================================
// COST ALERTS
// ============================================================================

export async function createCostAlert(data: InsertCostAlert): Promise<CostAlert> {
  const [alert] = await db.insert(costAlerts).values(data).returning();
  return alert;
}

export async function getCostAlert(id: string): Promise<CostAlert | null> {
  const [alert] = await db.select().from(costAlerts).where(eq(costAlerts.id, id));
  return alert || null;
}

export async function getUserCostAlerts(
  userId: string,
  filters?: {
    provider?: string;
    acknowledged?: boolean;
    resolved?: boolean;
  }
): Promise<CostAlert[]> {
  let query = db
    .select()
    .from(costAlerts)
    .where(eq(costAlerts.userId, userId))
    .orderBy(desc(costAlerts.triggeredAt));

  const alerts = await query;

  // Apply filters
  let filtered = alerts;
  if (filters?.provider) {
    filtered = filtered.filter(a => a.provider === filters.provider);
  }
  if (filters?.acknowledged !== undefined) {
    filtered = filtered.filter(a => a.acknowledged === filters.acknowledged);
  }
  if (filters?.resolved !== undefined) {
    filtered = filtered.filter(a => a.resolved === filters.resolved);
  }

  return filtered;
}

export async function getUnacknowledgedCostAlerts(userId: string): Promise<CostAlert[]> {
  return getUserCostAlerts(userId, { acknowledged: false });
}

export async function acknowledgeCostAlert(
  id: string,
  acknowledgedBy: string
): Promise<CostAlert> {
  const [updated] = await db
    .update(costAlerts)
    .set({
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy
    })
    .where(eq(costAlerts.id, id))
    .returning();
  return updated;
}

export async function resolveCostAlert(id: string): Promise<CostAlert> {
  const [updated] = await db
    .update(costAlerts)
    .set({
      resolved: true,
      resolvedAt: new Date()
    })
    .where(eq(costAlerts.id, id))
    .returning();
  return updated;
}

// Export all functions as a single object for convenience
export const storageV2 = {
  // Agent Sessions
  createAgentSession,
  getAgentSession,
  getUserAgentSessions,
  updateAgentSession,
  completeAgentSession,

  // Deployment Plans
  createDeploymentPlan,
  getDeploymentPlan,
  getUserDeploymentPlans,
  getPendingDeploymentPlans,
  updateDeploymentPlan,
  approveDeploymentPlan,
  rejectDeploymentPlan,

  // Agent Actions
  createAgentAction,
  getAgentAction,
  getUserAgentActions,
  getSessionAgentActions,
  updateAgentAction,
  approveAgentAction,

  // Cloud Connections
  createCloudConnection,
  getCloudConnection,
  getUserCloudConnections,
  getUserCloudConnectionByProvider,
  updateCloudConnection,
  ejectCloudConnection,
  deleteCloudConnection,

  // Ejection Exports
  createEjectionExport,
  getEjectionExport,
  getUserEjectionExports,
  updateEjectionExport,
  trackEjectionExportDownload,

  // Autonomy Settings
  createAutonomySettings,
  getUserAutonomySettings,
  upsertAutonomySettings,
  acceptAutonomyDisclaimer,

  // Cost Alerts
  createCostAlert,
  getCostAlert,
  getUserCostAlerts,
  getUnacknowledgedCostAlerts,
  acknowledgeCostAlert,
  resolveCostAlert
};

