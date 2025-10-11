/**
 * Careerate V2.0 Database Schema Extensions
 * 
 * New tables for AI Agent System & Ejectable Infrastructure
 * Date: October 11, 2025
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, index, integer, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, projects } from "./schema";

// ============================================================================
// AGENT SYSTEM TABLES
// ============================================================================

/**
 * Agent Sessions - Track AI agent conversations
 * Stores the conversation history and state for each user interaction with the AI
 */
export const agentSessions = pgTable("agent_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionType: text("session_type").notNull().default("deployment"), // "deployment", "monitoring", "cost-optimization", "general"
  conversationHistory: jsonb("conversation_history").notNull().default([]), // Array of {role, content, timestamp}
  currentContext: jsonb("current_context").default({}), // Current deployment/monitoring context
  agentState: jsonb("agent_state").default({}), // Agent's working memory
  status: text("status").notNull().default("active"), // "active", "completed", "aborted", "error"
  modelUsed: text("model_used"), // "claude-35-sonnet", "gpt-5", "phi-4"
  totalTokens: integer("total_tokens").default(0),
  totalCost: decimal("total_cost", { precision: 10, scale: 4 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

/**
 * Deployment Plans - AI-generated deployment architecture
 * Stores the agent's recommendations for deploying applications
 */
export const deploymentPlans = pgTable("deployment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
  agentSessionId: varchar("agent_session_id").references(() => agentSessions.id, { onDelete: "set null" }),
  naturalLanguageInput: text("natural_language_input").notNull(), // User's original request
  detectedFramework: text("detected_framework"), // auto-detected tech stack
  detectedDependencies: jsonb("detected_dependencies").default([]),
  provider: text("provider").notNull(), // "aws", "azure", "gcp", "vercel", "railway"
  region: text("region").notNull(),
  architecture: jsonb("architecture").notNull(), // { compute, database, storage, cdn, monitoring }
  scalingPolicy: jsonb("scaling_policy").default({}),
  costEstimate: jsonb("cost_estimate").notNull(), // { monthly, breakdown: { compute, database, storage, bandwidth } }
  reasoning: text("reasoning").notNull(), // AI's explanation for choices
  steps: jsonb("steps").notNull().default([]), // Deployment steps
  securityChecks: jsonb("security_checks").default([]),
  complianceChecks: jsonb("compliance_checks").default([]),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "deployed", "failed"
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id, { onDelete: "set null" }),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id, { onDelete: "set null" }),
  rejectionReason: text("rejection_reason"),
  deployedAt: timestamp("deployed_at"),
  deploymentId: varchar("deployment_id"), // Link to actual deployment
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Agent Actions - Log of all AI agent actions for audit trail
 * Every action taken by the AI is logged here for transparency and rollback
 */
export const agentActions = pgTable("agent_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentSessionId: varchar("agent_session_id").references(() => agentSessions.id, { onDelete: "set null" }),
  actionType: text("action_type").notNull(), // "deployment", "scaling", "rollback", "healing", "cost-optimization"
  agentType: text("agent_type").notNull(), // "planner", "deployer", "monitor", "healer", "cost-optimizer"
  modelUsed: text("model_used"), // Which AI model made the decision
  actionDetails: jsonb("action_details").notNull(),
  reasoning: text("reasoning"), // AI's explanation
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100
  riskLevel: text("risk_level"), // "low", "medium", "high"
  requiresApproval: boolean("requires_approval").default(false),
  approved: boolean("approved"),
  approvedBy: varchar("approved_by").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  status: text("status").notNull().default("pending"), // "pending", "executing", "completed", "failed", "rolled-back"
  result: jsonb("result"),
  error: text("error"),
  executionTimeMs: integer("execution_time_ms"),
  costImpact: integer("cost_impact"), // Estimated cost impact in cents
  resourcesAffected: jsonb("resources_affected").default([]),
  rollbackAvailable: boolean("rollback_available").default(false),
  rollbackExecutedAt: timestamp("rollback_executed_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userActionTypeIdx: index("agent_actions_user_action_type_idx").on(table.userId, table.actionType),
  sessionIdx: index("agent_actions_session_idx").on(table.agentSessionId),
  createdAtIdx: index("agent_actions_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// CLOUD CONNECTIONS & EJECTABLE INFRASTRUCTURE
// ============================================================================

/**
 * Cloud Connections - User's cloud account credentials (encrypted)
 * Stores cross-account access credentials for AWS, Azure, GCP
 */
export const cloudConnections = pgTable("cloud_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // "aws", "azure", "gcp"
  providerAccountId: text("provider_account_id"), // AWS account ID, Azure subscription ID, GCP project ID
  connectionName: text("connection_name").notNull(), // User-friendly name
  connectionType: text("connection_type").notNull(), // "iam-role", "service-principal", "service-account"
  encryptedCredentials: text("encrypted_credentials").notNull(), // AES-256 encrypted JSON
  credentialMetadata: jsonb("credential_metadata").default({}), // Non-sensitive metadata (region, etc.)
  permissions: jsonb("permissions").default([]), // Granted permissions/scopes
  status: text("status").notNull().default("connected"), // "connected", "ejected", "revoked", "error"
  lastHealthCheck: timestamp("last_health_check"),
  healthCheckStatus: text("health_check_status"), // "healthy", "degraded", "failed"
  connectedAt: timestamp("connected_at").defaultNow(),
  ejectedAt: timestamp("ejected_at"),
  ejectedBy: varchar("ejected_by").references(() => users.id, { onDelete: "set null" }),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userProviderIdx: index("cloud_connections_user_provider_idx").on(table.userId, table.provider),
}));

/**
 * Ejection Exports - Infrastructure as Code templates for ejected accounts
 * When users eject, we generate and store IaC templates here
 */
export const ejectionExports = pgTable("ejection_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cloudConnectionId: varchar("cloud_connection_id").notNull().references(() => cloudConnections.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // "aws", "azure", "gcp"
  templateFormat: text("template_format").notNull(), // "cloudformation", "arm", "terraform"
  templates: jsonb("templates").notNull(), // Array of { name, content, type }
  deploymentIds: jsonb("deployment_ids").default([]), // Associated deployments
  downloadUrl: text("download_url"), // Signed URL for ZIP download
  downloadUrlExpiry: timestamp("download_url_expiry"),
  downloadCount: integer("download_count").default(0),
  lastDownloadedAt: timestamp("last_downloaded_at"),
  includesManagementGuide: boolean("includes_management_guide").default(true),
  postEjectionNotes: text("post_ejection_notes"),
  expiresAt: timestamp("expires_at"), // Export file expiry (7 days default)
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// USER PREFERENCES & CONTROLS
// ============================================================================

/**
 * Autonomy Settings - User's AI agent control preferences
 * Controls how much the AI can do autonomously vs requiring approval
 */
export const autonomySettings = pgTable("autonomy_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  level: text("level").notNull().default("supervised"), // "supervised", "semi-autonomous", "fully-autonomous"
  costLimit: integer("cost_limit"), // Max monthly spend in cents
  maxResourcesPerDeployment: integer("max_resources_per_deployment").default(10),
  requireApprovalForActions: jsonb("require_approval_for_actions").default([]), // Array of action types requiring approval
  autoScalingEnabled: boolean("auto_scaling_enabled").default(false),
  autoHealingEnabled: boolean("auto_healing_enabled").default(false),
  costOptimizationEnabled: boolean("cost_optimization_enabled").default(true),
  notificationPreferences: jsonb("notification_preferences").default({}), // Email, SMS, Slack
  disclaimerAccepted: boolean("disclaimer_accepted").default(false),
  disclaimerAcceptedAt: timestamp("disclaimer_accepted_at"),
  disclaimerVersion: text("disclaimer_version"),
  riskAcknowledgement: text("risk_acknowledgement"),
  emergencyContactEmail: text("emergency_contact_email"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Cost Alerts - Budget threshold notifications
 * Monitors cloud spending and alerts users when thresholds are exceeded
 */
export const costAlerts = pgTable("cost_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cloudConnectionId: varchar("cloud_connection_id").references(() => cloudConnections.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // "aws", "azure", "gcp"
  alertType: text("alert_type").notNull(), // "threshold", "anomaly", "forecast"
  threshold: integer("threshold"), // Threshold in cents
  currentSpend: integer("current_spend").notNull().default(0), // Current spend in cents
  projectedSpend: integer("projected_spend"), // Forecasted monthly spend
  percentageOfThreshold: decimal("percentage_of_threshold", { precision: 5, scale: 2 }),
  anomalyDetails: jsonb("anomaly_details"), // For anomaly-type alerts
  triggeredAt: timestamp("triggered_at").defaultNow(),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id, { onDelete: "set null" }),
  actionTaken: text("action_taken"), // "none", "scaled-down", "disabled-resources", "notified-user"
  notificationsSent: jsonb("notifications_sent").default([]), // Array of notification types sent
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userProviderIdx: index("cost_alerts_user_provider_idx").on(table.userId, table.provider),
  triggeredAtIdx: index("cost_alerts_triggered_at_idx").on(table.triggeredAt),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const agentSessionsRelations = relations(agentSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [agentSessions.userId],
    references: [users.id],
  }),
  deploymentPlans: many(deploymentPlans),
  agentActions: many(agentActions),
}));

export const deploymentPlansRelations = relations(deploymentPlans, ({ one }) => ({
  user: one(users, {
    fields: [deploymentPlans.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [deploymentPlans.projectId],
    references: [projects.id],
  }),
  agentSession: one(agentSessions, {
    fields: [deploymentPlans.agentSessionId],
    references: [agentSessions.id],
  }),
  approver: one(users, {
    fields: [deploymentPlans.approvedBy],
    references: [users.id],
  }),
}));

export const cloudConnectionsRelations = relations(cloudConnections, ({ one, many }) => ({
  user: one(users, {
    fields: [cloudConnections.userId],
    references: [users.id],
  }),
  ejectionExports: many(ejectionExports),
  costAlerts: many(costAlerts),
}));

export const ejectionExportsRelations = relations(ejectionExports, ({ one }) => ({
  user: one(users, {
    fields: [ejectionExports.userId],
    references: [users.id],
  }),
  cloudConnection: one(cloudConnections, {
    fields: [ejectionExports.cloudConnectionId],
    references: [cloudConnections.id],
  }),
}));

export const autonomySettingsRelations = relations(autonomySettings, ({ one }) => ({
  user: one(users, {
    fields: [autonomySettings.userId],
    references: [users.id],
  }),
}));

export const costAlertsRelations = relations(costAlerts, ({ one }) => ({
  user: one(users, {
    fields: [costAlerts.userId],
    references: [users.id],
  }),
  cloudConnection: one(cloudConnections, {
    fields: [costAlerts.cloudConnectionId],
    references: [cloudConnections.id],
  }),
  acknowledger: one(users, {
    fields: [costAlerts.acknowledgedBy],
    references: [users.id],
  }),
}));

export const agentActionsRelations = relations(agentActions, ({ one }) => ({
  user: one(users, {
    fields: [agentActions.userId],
    references: [users.id],
  }),
  agentSession: one(agentSessions, {
    fields: [agentActions.agentSessionId],
    references: [agentSessions.id],
  }),
  approver: one(users, {
    fields: [agentActions.approvedBy],
    references: [users.id],
  }),
}));

// ============================================================================
// INSERT SCHEMAS (Zod validation)
// ============================================================================

export const insertAgentSessionSchema = createInsertSchema(agentSessions).pick({
  userId: true,
  sessionType: true,
  conversationHistory: true,
  currentContext: true,
  agentState: true,
  status: true,
  modelUsed: true,
  metadata: true,
});

export const insertDeploymentPlanSchema = createInsertSchema(deploymentPlans).pick({
  userId: true,
  projectId: true,
  agentSessionId: true,
  naturalLanguageInput: true,
  detectedFramework: true,
  detectedDependencies: true,
  provider: true,
  region: true,
  architecture: true,
  scalingPolicy: true,
  costEstimate: true,
  reasoning: true,
  steps: true,
  securityChecks: true,
  complianceChecks: true,
  metadata: true,
});

export const insertCloudConnectionSchema = createInsertSchema(cloudConnections).pick({
  userId: true,
  provider: true,
  providerAccountId: true,
  connectionName: true,
  connectionType: true,
  encryptedCredentials: true,
  credentialMetadata: true,
  permissions: true,
  metadata: true,
});

export const insertEjectionExportSchema = createInsertSchema(ejectionExports).pick({
  userId: true,
  cloudConnectionId: true,
  provider: true,
  templateFormat: true,
  templates: true,
  deploymentIds: true,
  postEjectionNotes: true,
  metadata: true,
});

export const insertAutonomySettingsSchema = createInsertSchema(autonomySettings).pick({
  userId: true,
  level: true,
  costLimit: true,
  maxResourcesPerDeployment: true,
  requireApprovalForActions: true,
  autoScalingEnabled: true,
  autoHealingEnabled: true,
  costOptimizationEnabled: true,
  notificationPreferences: true,
  disclaimerAccepted: true,
  disclaimerVersion: true,
  riskAcknowledgement: true,
  emergencyContactEmail: true,
  metadata: true,
});

export const insertCostAlertSchema = createInsertSchema(costAlerts).pick({
  userId: true,
  cloudConnectionId: true,
  provider: true,
  alertType: true,
  threshold: true,
  currentSpend: true,
  projectedSpend: true,
  anomalyDetails: true,
  metadata: true,
});

export const insertAgentActionSchema = createInsertSchema(agentActions).pick({
  userId: true,
  agentSessionId: true,
  actionType: true,
  agentType: true,
  modelUsed: true,
  actionDetails: true,
  reasoning: true,
  confidence: true,
  riskLevel: true,
  requiresApproval: true,
  costImpact: true,
  resourcesAffected: true,
  metadata: true,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSession = z.infer<typeof insertAgentSessionSchema>;

export type DeploymentPlan = typeof deploymentPlans.$inferSelect;
export type InsertDeploymentPlan = z.infer<typeof insertDeploymentPlanSchema>;

export type AgentAction = typeof agentActions.$inferSelect;
export type InsertAgentAction = z.infer<typeof insertAgentActionSchema>;

export type CloudConnection = typeof cloudConnections.$inferSelect;
export type InsertCloudConnection = z.infer<typeof insertCloudConnectionSchema>;

export type EjectionExport = typeof ejectionExports.$inferSelect;
export type InsertEjectionExport = z.infer<typeof insertEjectionExportSchema>;

export type AutonomySettings = typeof autonomySettings.$inferSelect;
export type InsertAutonomySettings = z.infer<typeof insertAutonomySettingsSchema>;

export type CostAlert = typeof costAlerts.$inferSelect;
export type InsertCostAlert = z.infer<typeof insertCostAlertSchema>;

