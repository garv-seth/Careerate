import { users, agents, workflows, cloudResources, agentLogs, type User, type InsertUser, type UpsertUser, type Agent, type InsertAgent, type Workflow, type InsertWorkflow, type CloudResource, type InsertCloudResource, type AgentLog, type InsertAgentLog } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Agents
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;

  // Workflows
  getAllWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  // Cloud Resources
  getAllCloudResources(): Promise<CloudResource[]>;
  getCloudResourcesByProvider(provider: string): Promise<CloudResource[]>;
  createCloudResource(resource: InsertCloudResource): Promise<CloudResource>;
  updateCloudResource(id: number, updates: Partial<CloudResource>): Promise<CloudResource | undefined>;

  // Agent Logs
  getAgentLogs(limit?: number): Promise<AgentLog[]>;
  createAgentLog(log: InsertAgentLog): Promise<AgentLog>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<number, Agent>;
  private workflows: Map<number, Workflow>;
  private cloudResources: Map<number, CloudResource>;
  private agentLogs: AgentLog[];
  private currentAgentId: number;
  private currentWorkflowId: number;
  private currentCloudResourceId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.workflows = new Map();
    this.cloudResources = new Map();
    this.agentLogs = [];

    this.currentAgentId = 1;
    this.currentWorkflowId = 1;
    this.currentCloudResourceId = 1;
    this.currentLogId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Initialize agents
    const defaultAgents: InsertAgent[] = [
      {
        name: "Planner Agent",
        type: "planner",
        status: "active",
        capabilities: JSON.stringify(["analyze-repo", "generate-plan"]),
        taskId: "101",
        metadata: JSON.stringify({ color: "indigo" })
      },
      {
        name: "Builder Agent",
        type: "builder", 
        status: "building",
        capabilities: JSON.stringify(["render-templates", "compile-assets"]),
        taskId: "101",
        metadata: JSON.stringify({ color: "violet" })
      },
      {
        name: "Tester Agent",
        type: "tester",
        status: "queued", 
        capabilities: JSON.stringify(["run-tests", "validate-security"]),
        taskId: "102",
        metadata: JSON.stringify({ color: "emerald" })
      },
      {
        name: "Deployer Agent",
        type: "deployer",
        status: "waiting",
        capabilities: JSON.stringify(["k8s-deploy", "serverless-deploy"]),
        taskId: "101",
        metadata: JSON.stringify({ color: "blue" })
      },
      {
        name: "Monitor Agent",
        type: "monitor",
        status: "standby",
        capabilities: JSON.stringify(["health-check", "auto-heal"]),
        taskId: null,
        metadata: JSON.stringify({ color: "orange" })
      }
    ];

    defaultAgents.forEach(agent => this.createAgent(agent));

    // Initialize cloud resources
    const defaultCloudResources: InsertCloudResource[] = [
      {
        provider: "aws",
        status: "active",
        region: "us-east-1",
        resourceType: "vpc",
        metadata: JSON.stringify({ icon: "fab fa-aws" }),
        cost: 52341
      },
      {
        provider: "gcp",
        status: "provisioning",
        region: "us-central1",
        resourceType: "gke",
        metadata: JSON.stringify({ icon: "fab fa-google" }),
        cost: 18793
      },
      {
        provider: "azure",
        status: "standby",
        region: "eastus",
        resourceType: "aks",
        metadata: JSON.stringify({ icon: "fab fa-microsoft" }),
        cost: 13598
      }
    ];

    defaultCloudResources.forEach(resource => this.createCloudResource(resource));

    // Initialize agent logs
    const defaultLogs: InsertAgentLog[] = [
      {
        fromAgent: "Planner",
        toAgent: "Builder",
        message: "Sent infraSpec with AWS VPC, ECS config",
        taskId: "101"
      },
      {
        fromAgent: "Builder",
        toAgent: "Tester",
        message: "Artifacts ready: docker:api:101, helm:charts/web",
        taskId: "101"
      }
    ];

    defaultLogs.forEach(log => this.createAgentLog(log));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      id: insertUser.id,
      email: insertUser.email ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      username: insertUser.username ?? null,
      tier: 'free',
      monthlyTokenUsage: 0,
      lastTokenReset: new Date(),
      stripeCustomerId: null,
      subscriptionStatus: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email ?? existingUser?.email ?? null,
      firstName: userData.firstName ?? existingUser?.firstName ?? null,
      lastName: userData.lastName ?? existingUser?.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? existingUser?.profileImageUrl ?? null,
      username: userData.username ?? existingUser?.username ?? null,
      tier: existingUser?.tier ?? 'free', // Default to free tier for new users
      monthlyTokenUsage: existingUser?.monthlyTokenUsage ?? 0,
      lastTokenReset: existingUser?.lastTokenReset ?? new Date(),
      stripeCustomerId: existingUser?.stripeCustomerId ?? null,
      subscriptionStatus: existingUser?.subscriptionStatus ?? null,
      updatedAt: new Date(),
      createdAt: existingUser?.createdAt ?? new Date()
    };
    this.users.set(userData.id, user);
    return user;
  }

  // User tier and token management methods
  async updateUserTokenUsage(userId: string, tokensUsed: number): Promise<number> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    // Reset monthly usage if it's a new month
    const now = new Date();
    const lastReset = new Date(user.lastTokenReset || now);
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

    const newUsage = isNewMonth ? tokensUsed : (user.monthlyTokenUsage || 0) + tokensUsed;
    const resetDate = isNewMonth ? now : lastReset;

    const updatedUser: User = {
      ...user,
      monthlyTokenUsage: newUsage,
      lastTokenReset: resetDate,
      updatedAt: now
    };

    this.users.set(userId, updatedUser);
    return newUsage;
  }

  async updateUserTier(userId: string, tier: 'free' | 'pro' | 'enterprise', stripeCustomerId?: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      tier,
      stripeCustomerId: stripeCustomerId || user.stripeCustomerId,
      updatedAt: new Date()
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Agents
  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const agent: Agent = { 
      ...insertAgent,
      id,
      status: insertAgent.status || "standby",
      capabilities: typeof insertAgent.capabilities === 'string' 
        ? JSON.parse(insertAgent.capabilities) 
        : insertAgent.capabilities || [],
      taskId: insertAgent.taskId || null,
      metadata: typeof insertAgent.metadata === 'string'
        ? JSON.parse(insertAgent.metadata || '{}')
        : insertAgent.metadata || null,
      createdAt: new Date()
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...updates };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: number): Promise<boolean> {
    return this.agents.delete(id);
  }

  // Workflows
  async getAllWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentWorkflowId++;
    const workflow: Workflow = { 
      ...insertWorkflow,
      id,
      status: insertWorkflow.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = { ...workflow, ...updates, updatedAt: new Date() };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  // Cloud Resources
  async getAllCloudResources(): Promise<CloudResource[]> {
    return Array.from(this.cloudResources.values());
  }

  async getCloudResourcesByProvider(provider: string): Promise<CloudResource[]> {
    return Array.from(this.cloudResources.values()).filter(
      resource => resource.provider === provider
    );
  }

  async createCloudResource(insertResource: InsertCloudResource): Promise<CloudResource> {
    const id = this.currentCloudResourceId++;
    const resource: CloudResource = { 
      ...insertResource,
      id,
      region: insertResource.region || null,
      metadata: typeof insertResource.metadata === 'string'
        ? JSON.parse(insertResource.metadata || '{}')
        : insertResource.metadata || null,
      cost: insertResource.cost || null,
      createdAt: new Date()
    };
    this.cloudResources.set(id, resource);
    return resource;
  }

  async updateCloudResource(id: number, updates: Partial<CloudResource>): Promise<CloudResource | undefined> {
    const resource = this.cloudResources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...updates };
    this.cloudResources.set(id, updatedResource);
    return updatedResource;
  }

  // Agent Logs
  async getAgentLogs(limit: number = 50): Promise<AgentLog[]> {
    return this.agentLogs
      .slice(-limit)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createAgentLog(insertLog: InsertAgentLog): Promise<AgentLog> {
    const id = this.currentLogId++;
    const log: AgentLog = { 
      ...insertLog,
      id,
      taskId: insertLog.taskId || null,
      timestamp: new Date()
    };
    this.agentLogs.push(log);
    return log;
  }
}

export const storage = new MemStorage();
