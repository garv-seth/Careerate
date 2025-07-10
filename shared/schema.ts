import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type CloudResource = typeof cloudResources.$inferSelect;
export type InsertCloudResource = z.infer<typeof insertCloudResourceSchema>;
export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = z.infer<typeof insertAgentLogSchema>;
