# Careerate Architecture - Complete System Design

**Date**: October 11, 2025  
**Version**: 2.0 (Complete Rebuild)  
**Status**: Design Complete, Implementation In Progress

---

## Executive Summary

Careerate v2.0 is a complete ground-up rebuild using:
- **Frontend**: Next.js 15 (App Router) + Progressive Web App (PWA)
- **Backend**: Node.js + Express + Microsoft Semantic Kernel
- **AI**: Azure AI Foundry (Claude 3.5 Sonnet, GPT-5, Phi-4)
- **Infrastructure**: Multi-cloud deployment to user-owned accounts (AWS, Azure, GCP)
- **Database**: Azure PostgreSQL Flexible Server
- **Hosting**: Azure Container Apps

**Key Innovation**: Porter.run-style ejectable infrastructure + AI-powered natural language deployment + multi-cloud intelligence.

---

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        USERS (Web/Mobile)                         │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Azure Front Door (CDN + SSL)                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js 15 App    │         │   Express Backend    │
│   (App Router +     │         │   (Node.js + AI)     │
│    PWA + RSC)       │         │                      │
│  [Azure Container   │         │  [Azure Container    │
│      Apps]          │         │      Apps]           │
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           │                               ▼
           │                    ┌──────────────────────┐
           │                    │  Microsoft Semantic  │
           │                    │  Kernel (Agents)     │
           │                    │                      │
           │                    │  - Planner Agent     │
           │                    │  - Deployer Agent    │
           │                    │  - Monitor Agent     │
           │                    │  - Healer Agent      │
           │                    │  - Cost Optimizer    │
           │                    └──────────┬───────────┘
           │                               │
           │                               ▼
           │                    ┌──────────────────────┐
           │                    │  Azure AI Foundry    │
           │                    │                      │
           │                    │  - Claude 3.5 Sonnet │
           │                    │  - GPT-5             │
           │                    │  - Phi-4 Reasoning   │
           │                    └──────────┬───────────┘
           │                               │
           ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Azure PostgreSQL Flexible Server                │
│                   (Drizzle ORM + Connection Pooling)              │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Azure Key Vault                               │
│   (OAuth secrets, API keys, encryption keys)                     │
└───────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              USER CLOUD ACCOUNTS (Ejectable)                      │
├──────────────────────────────────────────────────────────────────┤
│  AWS                     Azure                      GCP           │
│  ├─ ECS/Fargate          ├─ Container Apps         ├─ Cloud Run  │
│  ├─ Lambda               ├─ Functions              ├─ Functions   │
│  ├─ RDS                  ├─ PostgreSQL             ├─ Cloud SQL   │
│  ├─ S3                   ├─ Blob Storage           ├─ Storage     │
│  └─ CloudWatch           └─ Monitor                └─ Logging     │
│                                                                    │
│  Access via:             Access via:                Access via:   │
│  - IAM Cross-Account     - Service Principal       - Service Acct │
│  - CloudFormation        - ARM Templates           - Terraform    │
│  - Ejectable             - Ejectable               - Ejectable    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture (Next.js 15)

### Technology Stack
- **Framework**: Next.js 15.0+ (App Router)
- **Language**: TypeScript 5.9+
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion 12+
- **State**: TanStack Query (React Query)
- **PWA**: @ducanh2912/next-pwa
- **Code Editor**: Monaco Editor

### Routing Structure

```
app/
├── layout.tsx                          # Root layout (providers, fonts)
├── globals.css                         # Tailwind + custom styles
│
├── (marketing)/                        # Public routes (no auth)
│   ├── layout.tsx                      # Marketing shell (header, footer)
│   ├── page.tsx                        # Landing page (hero + features)
│   ├── features/
│   │   └── page.tsx                    # Feature details
│   ├── pricing/
│   │   └── page.tsx                    # Pricing tiers
│   ├── docs/
│   │   ├── page.tsx                    # Documentation hub
│   │   ├── getting-started/
│   │   ├── deployment-guide/
│   │   ├── api-reference/
│   │   └── ejection-guide/
│   └── install/
│       └── page.tsx                    # PWA install guide
│
├── (app)/                              # Authenticated app routes
│   ├── layout.tsx                      # App shell (sidebar, user menu)
│   ├── projects/
│   │   ├── page.tsx                    # Project list
│   │   └── [id]/
│   │       ├── page.tsx                # Project dashboard
│   │       ├── deployments/
│   │       ├── settings/
│   │       └── logs/
│   ├── deploy/
│   │   └── page.tsx                    # Natural language deployment UI
│   ├── integrations/
│   │   ├── page.tsx                    # Cloud accounts + services
│   │   ├── aws/
│   │   ├── azure/
│   │   └── gcp/
│   ├── monitoring/
│   │   ├── page.tsx                    # Real-time dashboards
│   │   ├── metrics/
│   │   └── alerts/
│   ├── costs/
│   │   └── page.tsx                    # Cost tracking & optimization
│   └── settings/
│       ├── page.tsx                    # User settings
│       ├── autonomy/                   # Agent autonomy level
│       └── billing/
│
├── api/                                # API route handlers
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts                # NextAuth.js handler
│   ├── deploy/
│   │   └── route.ts                    # Deployment initiation
│   ├── agent/
│   │   ├── chat/route.ts               # Agent conversation
│   │   └── stream/route.ts             # SSE for real-time updates
│   ├── webhooks/
│   │   ├── github/route.ts
│   │   └── stripe/route.ts
│   └── health/
│       └── route.ts                    # Health check endpoint
│
└── components/
    ├── ui/                             # shadcn/ui components
    ├── providers/                      # React context providers
    ├── CookieConsent.tsx               # Bottom-center cookie banner
    ├── PWAInstallPrompt.tsx            # Install prompt for mobile
    ├── AgentChat.tsx                   # Chat interface for agent
    ├── DeploymentProgress.tsx          # Real-time deployment status
    └── CybercoreBackground.tsx         # Preserved hero animation
```

### Key Features

#### 1. Server Components by Default
- All components are React Server Components unless marked `'use client'`
- Eliminates hydration errors (main reason for rebuild)
- Faster initial page loads
- Reduced JavaScript bundle size

#### 2. Progressive Web App (PWA)
- **Manifest**: Installable on mobile devices
- **Service Worker**: Offline support, background sync
- **Push Notifications**: Deployment status updates
- **Install Prompt**: Guide users to install (dismissible, reappears weekly)

**next.config.js**:
```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true
});
```

#### 3. Streaming Server Components (RSC)
- Agent responses stream in real-time
- Deployment progress updates without client-side polling
- Lower Time to First Byte (TTFB)

**Example**:
```typescript
// app/(app)/deploy/page.tsx
import { Suspense } from 'react';

export default async function DeployPage() {
  return (
    <Suspense fallback={<DeploymentSkeleton />}>
      <DeploymentUI />
    </Suspense>
  );
}

async function DeploymentUI() {
  const deployments = await fetchDeployments();  // Server-side fetch
  return <DeploymentList deployments={deployments} />;
}
```

#### 4. Cookie Consent (Redesigned)
- Bottom-center positioning
- Responsive sizing (320px - 1920px)
- Glass-pane design (matches brand)
- GDPR/CCPA compliant

**Component**:
```typescript
'use client';

export function CookieConsent() {
  const [accepted, setAccepted] = useState(false);
  
  useEffect(() => {
    setAccepted(localStorage.getItem('cookieConsent') === 'accepted');
  }, []);
  
  if (accepted) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md sm:max-w-lg md:max-w-2xl"
    >
      <div className="glass-pane rounded-2xl p-4 sm:p-6">
        {/* ... */}
      </div>
    </motion.div>
  );
}
```

---

## Backend Architecture (Node.js + Express)

### Technology Stack
- **Runtime**: Node.js 20 LTS
- **Framework**: Express 5.1+
- **Language**: TypeScript 5.9+
- **AI Framework**: Microsoft Semantic Kernel 1.0+
- **Database**: Drizzle ORM + PostgreSQL
- **Authentication**: NextAuth.js + Azure AD
- **Secrets**: Azure Key Vault SDK
- **MCP**: Model Context Protocol servers

### Service Layer Structure

```
server/
├── index.ts                            # Express app initialization
├── routes/
│   ├── agents.ts                       # Agent orchestration endpoints
│   ├── deployments.ts                  # Deployment management
│   ├── integrations.ts                 # Cloud account connections
│   ├── monitoring.ts                   # Real-time metrics
│   └── ejection.ts                     # Infrastructure export/ejection
│
├── agents/                             # Semantic Kernel agents
│   ├── orchestrator.ts                 # Main agent coordinator
│   ├── planner.ts                      # Analyzes intent, creates plans
│   ├── deployer.ts                     # Executes cloud deployments
│   ├── monitor.ts                      # Watches health/metrics
│   ├── healer.ts                       # Auto-remediates issues
│   └── cost-optimizer.ts               # Reduces cloud spend
│
├── cloud/                              # Cloud provider implementations
│   ├── aws/
│   │   ├── cloudformation.ts           # Template generation
│   │   ├── iam-roles.ts                # Cross-account access
│   │   ├── deployer.ts                 # ECS/Lambda deployment
│   │   └── ejector.ts                  # Export & revoke
│   ├── azure/
│   │   ├── arm-templates.ts            # ARM template generation
│   │   ├── service-principals.ts       # OAuth flow
│   │   ├── deployer.ts                 # Container Apps deployment
│   │   └── ejector.ts                  # Export & revoke
│   └── gcp/
│       ├── terraform.ts                # Terraform generation
│       ├── service-accounts.ts         # SA management
│       ├── deployer.ts                 # Cloud Run deployment
│       └── ejector.ts                  # Export & revoke
│
├── integrations/                       # Third-party services
│   ├── github.ts                       # Repository operations
│   ├── datadog.ts                      # Monitoring setup
│   ├── stripe.ts                       # Billing
│   └── mcp-servers/                    # MCP plugins
│       ├── filesystem.ts
│       ├── github.ts
│       └── postgres.ts
│
└── services/
    ├── deployment.ts                   # Deployment orchestration
    ├── monitoring.ts                   # Metrics collection
    ├── cost-tracking.ts                # Usage & billing
    ├── ejection.ts                     # IaC export & revocation
    └── azure-keyvault.ts               # Secret management
```

### Semantic Kernel Integration

**Initialization** (`server/agents/orchestrator.ts`):
```typescript
import { Kernel, IChatCompletionService, KernelFunction } from 'semantic-kernel';
import { AzureOpenAIChatCompletion } from 'semantic-kernel/connectors/azure-openai';

class AgentOrchestrator {
  private kernel: Kernel;
  
  async initialize() {
    this.kernel = new Kernel();
    
    // Register AI services
    const claudeService = new AzureOpenAIChatCompletion({
      deploymentName: 'claude-35-sonnet',
      endpoint: process.env.AZURE_CLAUDE_ENDPOINT!,
      apiKey: await keyVault.getSecret('AZURE-CLAUDE-KEY')
    });
    
    this.kernel.addService('claude', claudeService);
    
    // Register skills (plugins)
    await this.kernel.importSkill(new DeploymentSkill(), 'Deploy');
    await this.kernel.importSkill(new MonitoringSkill(), 'Monitor');
    await this.kernel.importSkill(new CostOptimizationSkill(), 'CostOpt');
    
    // Register MCP servers
    await this.kernel.importMCPServer('github', githubMCPServer);
    await this.kernel.importMCPServer('filesystem', fileSystemMCPServer);
  }
  
  async processUserIntent(input: string, context: DeploymentContext) {
    const plan = await this.kernel.invoke('Deploy', 'AnalyzeIntent', {
      input,
      repository: context.repoUrl,
      framework: context.framework
    });
    
    return plan;
  }
}
```

**Agent Types**:

1. **Planner Agent**
   - Analyzes natural language input
   - Detects tech stack from repository
   - Recommends cloud provider, region, architecture
   - Estimates costs before deployment
   - Explains reasoning to user

2. **Deployer Agent**
   - Checks autonomy level (supervised, semi, full)
   - Requests user approval for high-risk actions
   - Executes deployment steps via MCP servers
   - Streams progress updates (SSE)
   - Handles rollback on failure

3. **Monitor Agent**
   - Continuously watches deployed apps
   - Collects metrics (CPU, memory, requests, errors)
   - Detects anomalies (ML-based)
   - Triggers alerts for high error rates/latency
   - Calls Healer Agent when needed

4. **Healer Agent**
   - Diagnoses issues (logs + metrics analysis)
   - Auto-remediates common problems:
     - Restart crashed containers
     - Rollback bad deployments
     - Scale up under load
     - Flush caches
   - Requests user assistance for complex issues

5. **Cost Optimizer Agent**
   - Analyzes resource utilization
   - Identifies over-provisioned resources
   - Suggests rightsizing (smaller instances)
   - Recommends reserved instances/savings plans
   - Predicts future costs based on trends

---

## AI Model Strategy (Azure AI Foundry)

### Model Selection

| Model | Provider | Use Case | Reason |
|-------|----------|----------|--------|
| **Claude 3.5 Sonnet** | Anthropic (via Azure) | Primary reasoning, planning, code analysis | Best reasoning capabilities, long context (200K tokens), safety features |
| **GPT-5** | OpenAI (via Azure) | Code generation, natural language understanding | Excellent coding, fast inference, multimodal (if needed) |
| **Phi-4** | Microsoft | Cost optimization, architecture decisions | Microsoft's reasoning model, optimized for Azure, cost-effective |
| **GPT-4o** (fallback) | OpenAI (via Azure) | Backup if others unavailable | Proven reliability, widely available |

### Model Routing Logic

```typescript
async function selectModel(task: AgentTask): Promise<ModelConfig> {
  switch (task.type) {
    case 'deployment-planning':
    case 'issue-diagnosis':
    case 'complex-reasoning':
      return { model: 'claude-35-sonnet', maxTokens: 4096 };
    
    case 'code-generation':
    case 'natural-language-parsing':
      return { model: 'gpt-5', maxTokens: 2048 };
    
    case 'cost-analysis':
    case 'architecture-recommendation':
      return { model: 'phi-4', maxTokens: 1024 };
    
    default:
      return { model: 'gpt-4o', maxTokens: 2048 };  // Fallback
  }
}
```

### Azure AI Foundry Setup

1. **Create Workspace**:
   ```bash
   az ml workspace create --name careerate-ai \
     --resource-group Careerate \
     --location eastus2
   ```

2. **Deploy Models**:
   - Claude 3.5 Sonnet: Managed endpoint via Azure OpenAI Service
   - GPT-5: Azure OpenAI Service endpoint
   - Phi-4: Azure Machine Learning managed endpoint

3. **Store Credentials**:
   ```bash
   az keyvault secret set --vault-name careeeratesecretsvault \
     --name "AZURE-CLAUDE-ENDPOINT" \
     --value "https://careerate-ai.openai.azure.com/"
   
   az keyvault secret set --vault-name careeeratesecretsvault \
     --name "AZURE-CLAUDE-KEY" \
     --value "..."
   ```

---

## Database Architecture (PostgreSQL)

### Schema Design

**New Tables for v2.0**:

```typescript
// schema.ts (Drizzle ORM)

export const agentSessions = pgTable('agent_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  conversationHistory: jsonb('conversation_history').notNull(),  // Chat messages
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const deploymentPlans = pgTable('deployment_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  naturalLanguageInput: text('natural_language_input').notNull(),
  provider: text('provider').notNull(),  // 'aws' | 'azure' | 'gcp'
  region: text('region').notNull(),
  architecture: jsonb('architecture').notNull(),  // compute, database, storage, CDN
  costEstimate: jsonb('cost_estimate').notNull(),  // monthly, breakdown
  reasoning: text('reasoning').notNull(),  // AI explanation
  status: text('status').notNull(),  // 'pending' | 'approved' | 'rejected' | 'deployed'
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const cloudConnections = pgTable('cloud_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: text('provider').notNull(),  // 'aws' | 'azure' | 'gcp'
  credentials: text('credentials').notNull(),  // Encrypted JSON
  metadata: jsonb('metadata'),  // accountId, subscriptionId, projectId, etc.
  status: text('status').notNull(),  // 'connected' | 'ejected' | 'revoked'
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  ejectedAt: timestamp('ejected_at')
});

export const ejectionExports = pgTable('ejection_exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  cloudConnectionId: uuid('cloud_connection_id').references(() => cloudConnections.id).notNull(),
  templates: jsonb('templates').notNull(),  // CloudFormation/ARM/Terraform
  downloadUrl: text('download_url').notNull(),  // Signed URL for ZIP
  expiresAt: timestamp('expires_at').notNull(),  // Download link expiry
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const autonomySettings = pgTable('autonomy_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  level: text('level').notNull(),  // 'supervised' | 'semi-autonomous' | 'fully-autonomous'
  costLimit: integer('cost_limit'),  // Max monthly spend (cents)
  requireApprovalForActions: jsonb('require_approval_for_actions'),  // Array of action types
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const costAlerts = pgTable('cost_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  threshold: integer('threshold').notNull(),  // Threshold in cents
  currentSpend: integer('current_spend').notNull(),  // Current spend in cents
  provider: text('provider').notNull(),  // 'aws' | 'azure' | 'gcp'
  triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
  acknowledged: boolean('acknowledged').default(false)
});
```

### Encryption Strategy

**Sensitive Data Encryption**:
- Cloud credentials (IAM role ARNs, Service Principal secrets, Service Account keys)
- Encrypted at rest using AES-256
- Encryption key stored in Azure Key Vault
- Decrypted only in memory, never logged

```typescript
import { encrypt, decrypt } from './encryption';

async function saveCloudConnection(userId: string, provider: string, credentials: any) {
  const encryptedCredentials = await encrypt(JSON.stringify(credentials));
  
  await db.insert(cloudConnections).values({
    userId,
    provider,
    credentials: encryptedCredentials,
    status: 'connected'
  });
}

async function getCloudConnection(userId: string, provider: string) {
  const connection = await db.query.cloudConnections.findFirst({
    where: (cc, { eq, and }) => and(
      eq(cc.userId, userId),
      eq(cc.provider, provider),
      eq(cc.status, 'connected')
    )
  });
  
  if (!connection) return null;
  
  const decryptedCredentials = await decrypt(connection.credentials);
  return { ...connection, credentials: JSON.parse(decryptedCredentials) };
}
```

---

## Security Architecture

### Authentication Flow (NextAuth.js)

```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      tenantId: process.env.AZURE_TENANT_ID!
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Authorization Levels

**User Roles**:
- `user`: Basic user, can create projects and deployments
- `admin`: Full access to all features
- `enterprise`: Custom roles and permissions

**Permission Checks**:
```typescript
async function requireAuth(req: Request): Promise<User> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  return session.user;
}

async function requireOwnership(userId: string, resourceId: string) {
  const resource = await db.getResource(resourceId);
  if (resource.userId !== userId) {
    throw new ForbiddenError('Not authorized to access this resource');
  }
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Agent API rate limit (more restrictive)
const agentLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,  // 10 agent requests per minute
  message: 'Agent rate limit exceeded'
});

app.use('/api/', apiLimiter);
app.use('/api/agent/', agentLimiter);
```

---

## Deployment & Infrastructure

### Azure Container Apps

**Configuration**:
```yaml
# azure-container-app.yaml

properties:
  configuration:
    activeRevisionsMode: Multiple
    ingress:
      external: true
      targetPort: 5000
      transport: http
      allowInsecure: false
    secrets:
      - name: database-url
        keyVaultUrl: https://careeeratesecretsvault.vault.azure.net/secrets/DATABASE-URL
      - name: azure-claude-key
        keyVaultUrl: https://careeeratesecretsvault.vault.azure.net/secrets/AZURE-CLAUDE-KEY
    registries:
      - server: careerateacr.azurecr.io
        identity: system
  template:
    containers:
      - name: careerate-web
        image: careerateacr.azurecr.io/careerate:latest
        resources:
          cpu: 1.0
          memory: 2Gi
        env:
          - name: DATABASE_URL
            secretRef: database-url
          - name: AZURE_CLAUDE_KEY
            secretRef: azure-claude-key
    scale:
      minReplicas: 2
      maxReplicas: 10
      rules:
        - name: http-scaling
          http:
            metadata:
              concurrentRequests: '100'
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker Image
        run: |
          docker build -t careerateacr.azurecr.io/careerate:${{ github.sha }} .
          docker tag careerateacr.azurecr.io/careerate:${{ github.sha }} careerateacr.azurecr.io/careerate:latest
      
      - name: Push to ACR
        run: |
          az acr login --name careerateacr
          docker push careerateacr.azurecr.io/careerate:${{ github.sha }}
          docker push careerateacr.azurecr.io/careerate:latest
      
      - name: Deploy to Container Apps
        run: |
          az containerapp update \
            --name careerate-web \
            --resource-group Careerate \
            --image careerateacr.azurecr.io/careerate:${{ github.sha }}
      
      - name: Run Health Check
        run: |
          curl -f https://gocareerate.com/api/health || exit 1
```

---

## Monitoring & Observability

### Application Insights

```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING
  }
});

appInsights.loadAppInsights();
appInsights.trackPageView();

export { appInsights };
```

### Metrics Collection

**Key Metrics**:
- Deployment success rate
- Time to first deployment
- Agent response time
- Cost savings (actual vs predicted)
- Ejection rate
- User retention

**Implementation**:
```typescript
async function trackDeployment(deployment: Deployment) {
  await metrics.track('deployment_started', {
    userId: deployment.userId,
    provider: deployment.provider,
    framework: deployment.framework
  });
  
  // ... deployment logic ...
  
  await metrics.track('deployment_completed', {
    userId: deployment.userId,
    provider: deployment.provider,
    duration: deployment.durationMs,
    success: deployment.status === 'success'
  });
}
```

---

## Performance Targets

| Metric | Target | Current Baseline |
|--------|--------|------------------|
| **Page Load (LCP)** | <2.5s | TBD |
| **Time to Interactive (TTI)** | <3.5s | TBD |
| **API Response Time (p95)** | <500ms | TBD |
| **Agent Response Time** | <10s | TBD |
| **Deployment Time** | <5min | TBD |
| **Lighthouse Score** | >90 | TBD |
| **Uptime** | 99.9% | TBD |

---

## Scalability Considerations

### Horizontal Scaling
- Azure Container Apps auto-scales based on HTTP requests
- PostgreSQL read replicas for heavy queries
- Redis for caching (Azure Cache for Redis)

### Vertical Scaling
- Start with 1 CPU / 2GB RAM per container
- Scale to 2 CPU / 4GB RAM under load
- Database: Standard_D2ds_v5 (2 vCores, 8GB)

### Cost Optimization
- Use Azure Reservations for Container Apps (up to 30% savings)
- Spot instances for batch processing
- Auto-scale to zero for dev environments

---

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups (7-day retention)
- **Secrets**: Key Vault backed up to geo-redundant storage
- **Code**: Git (already versioned)

### Recovery Time Objectives (RTO)
- **Database Restore**: 15 minutes
- **Full System**: 1 hour
- **Data Loss (RPO)**: <5 minutes (transaction log backups)

---

## Next Steps

1. Initialize Next.js 15 project with App Router
2. Set up Azure AI Foundry workspace and deploy models
3. Implement Semantic Kernel multi-agent system
4. Build cloud provider adapters (AWS, Azure, GCP)
5. Create database schema and migrations
6. Develop frontend components (PWA-ready)
7. Test end-to-end deployment flow
8. Deploy to production (staged rollout)

**Estimated Timeline**: 7 weeks (as per plan)

---

## Conclusion

This architecture enables Careerate to be the ONLY platform that combines:
- Natural language deployment (AI-first)
- Multi-cloud intelligence (AWS + Azure + GCP)
- Ejectable infrastructure (Porter-style)
- Autonomous operations (AI SRE team)

**Key Innovation**: Ejectability + AI automation = trust + convenience.

🚀 **Let's build it.**

