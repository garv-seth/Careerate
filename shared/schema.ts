import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication and app data
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // OAuth provider user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username", { length: 50 }).unique(), // Keep for backwards compatibility
  tier: varchar("tier", { length: 20 }).notNull().default("free"), // free, pro, enterprise
  monthlyTokenUsage: integer("monthly_token_usage").default(0),
  lastTokenReset: timestamp("last_token_reset").defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id"),
  subscriptionStatus: varchar("subscription_status"), // active, canceled, past_due
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // planner, builder, tester, deployer, monitor
  status: text("status").notNull().default("standby"), // active, building, queued, waiting, standby
  capabilities: text("capabilities").notNull().default("[]"),
  taskId: text("task_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  projectName: text("project_name").notNull(),
  status: text("status").notNull().default("draft"), // draft, running, completed, failed
  nodes: json("nodes").$type<any[]>().notNull(),
  connections: json("connections").$type<any[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cloudResources = pgTable("cloud_resources", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(), // aws, gcp, azure
  status: text("status").notNull(), // active, provisioning, standby, error
  region: text("region"),
  resourceType: text("resource_type").notNull(),
  metadata: text("metadata"),
  cost: integer("cost"), // in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentLogs = pgTable("agent_logs", {
  id: serial("id").primaryKey(),
  fromAgent: text("from_agent").notNull(),
  toAgent: text("to_agent").notNull(),
  message: text("message").notNull(),
  taskId: text("task_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCloudResourceSchema = createInsertSchema(cloudResources).omit({
  id: true,
  createdAt: true,
});

export const insertAgentLogSchema = createInsertSchema(agentLogs).omit({
  id: true,
  timestamp: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type CloudResource = typeof cloudResources.$inferSelect;
export type InsertCloudResource = z.infer<typeof insertCloudResourceSchema>;
export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = z.infer<typeof insertAgentLogSchema>;
