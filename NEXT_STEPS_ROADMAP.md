# Careerate Implementation Roadmap
**Status**: Model Upgrades Complete - Production Features In Progress
**Last Updated**: October 15, 2025

---

## ✅ **COMPLETED** (This Session)

###  1. **Latest AI Models Integration**
- ✅ **GPT-5** (flagship reasoning) with `reasoning_effort` param
- ✅ **GPT-5 Mini** (2x faster, 1/3 price)
- ✅ **Claude Sonnet 4.5** ($3/$15/M tokens) - best for complex coding
- ✅ **Claude Haiku 4.5** ($1/$5/M tokens) - cheapest near-frontier model
- ✅ **Phi-4** ($0.13/$0.50/M tokens) - ultra-cheap reasoning
- ✅ **Phi-4 Mini Flash** (10x faster) - real-time tasks

### 2. **Smart Model Selection Strategy**
```typescript
Planning/Architecture → GPT-5 (best reasoning)
Complex Coding       → Claude Sonnet 4.5
Monitoring           → Claude Haiku 4.5 (fast + cheap)
Healing              → Phi-4 (cheap reasoning)
Real-time Tasks      → Phi-4 Mini Flash (ultra-fast)
```

### 3. **Bug Fixes**
- ✅ API 500 errors (dashboard metrics, agent sessions)
- ✅ Scroll-to-bottom on page navigation
- ✅ Agent page UI layout
- ✅ Integrations page mobile responsiveness

---

## 🚧 **IN PROGRESS** (Next Priorities)

### **CRITICAL PATH** (Must Complete Before Launch)

#### 1. **Implement MCP (Model Context Protocol) Server** ⏱️ 2-3 days
**Why**: Industry standard adopted by OpenAI + Anthropic. Enables interoperability.

**Tasks**:
- [ ] Install pre-built MCP servers:
  - `@modelcontextprotocol/server-github` (GitHub integration)
  - `@modelcontextprotocol/server-postgres` (Database queries)
  - `@modelcontextprotocol/server-slack` (Notifications)
- [ ] Create `server/services/mcp/server.ts`
- [ ] Expose MCP endpoints: `/api/mcp/tools`, `/api/mcp/resources`
- [ ] Add WebSocket support for streaming operations
- [ ] Implement permission system for sensitive operations

**Reference**:
- https://github.com/modelcontextprotocol
- `docs/MCP_ARCHITECTURE.md` (already documented)

---

#### 2. **Build Real Agent Tools** ⏱️ 3-4 days
**Current**: AgentToolRegistry returns mock responses
**Need**: Real API integrations

**Priority Tools**:
```typescript
// High Priority (Week 1)
✅ deploy_to_azure_container_apps - Already works!
✅ build_docker_image_acr - Already works!
⚠️ monitor_azure_deployment - Uses mock metrics
⚠️ restart_azure_container_app - Stub method
⚠️ scale_azure_container_app - Stub method

// Medium Priority (Week 2)
❌ provision_postgres_database
❌ setup_github_actions_pipeline
❌ configure_custom_domain
❌ setup_ssl_certificate

// Low Priority (Week 3+)
❌ send_slack_notification
❌ query_deployment_logs
❌ analyze_cost_trends
```

**Implementation Pattern**:
```typescript
// server/tools/azureMonitoring.ts
export async function monitorAzureDeployment(params: {
  appName: string;
  resourceGroup: string;
}): Promise<HealthMetrics> {
  const monitorClient = new MonitorClient(credentials, subscriptionId);

  // Real Azure Monitor query
  const metrics = await monitorClient.metrics.list(
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.App/containerApps/${params.appName}`,
    {
      interval: 'PT1M',
      metricnames: 'CpuUsage,MemoryUsage,RequestsPerSecond,ErrorRate'
    }
  );

  return parseMetricsToHealthData(metrics);
}
```

---

#### 3. **Fix MonitorAgent** (Real Azure Monitor SDK) ⏱️ 1 day
**File**: `server/agents/monitorAgent.ts:121-140`

**Current**:
```typescript
private generateMockMetrics(deploymentId: string): HealthMetrics {
  return { /* fake data */ };
}
```

**Replace With**:
```typescript
import { MonitorClient } from '@azure/arm-monitor';

private async getRealMetrics(deploymentId: string): Promise<HealthMetrics> {
  const metrics = await this.monitorClient.metrics.list(
    resourceId,
    { interval: 'PT1M', metricnames: 'CpuUsage,MemoryUsage,Requests,Failures' }
  );

  return {
    deploymentId,
    status: this.calculateStatus(metrics),
    cpuUsage: extractMetric(metrics, 'CpuUsage'),
    memoryUsage: extractMetric(metrics, 'MemoryUsage'),
    errorRate: calculateErrorRate(metrics),
    responseTime: extractMetric(metrics, 'AvgResponseTime'),
    ...
  };
}
```

---

#### 4. **Fix HealerAgent** (Real Azure Container Apps SDK) ⏱️ 1 day
**File**: `server/agents/healerAgent.ts:345-380`

**Current (Stubs)**:
```typescript
private async restartDeployment(deploymentId: string): Promise<void> {
  await this.sleep(1000); // MOCK!
}

private async scaleDeployment(deploymentId: string, direction: 'up' | 'down'): Promise<void> {
  await this.sleep(1000); // MOCK!
}
```

**Replace With**:
```typescript
import { ContainerAppsAPIClient } from '@azure/arm-appcontainers';

private async restartDeployment(deploymentId: string): Promise<void> {
  const resourceGroup = process.env.AZURE_RESOURCE_GROUP!;
  await this.azureClient.containerApps.beginRestartAndWait(resourceGroup, deploymentId);
}

private async scaleDeployment(deploymentId: string, direction: 'up' | 'down'): Promise<void> {
  const app = await this.azureClient.containerApps.get(resourceGroup, deploymentId);
  const currentReplicas = app.properties?.template?.scale?.minReplicas || 1;
  const newReplicas = direction === 'up' ? currentReplicas + 1 : Math.max(1, currentReplicas - 1);

  await this.azureClient.containerApps.beginUpdateAndWait(resourceGroup, deploymentId, {
    ...app,
    properties: {
      ...app.properties,
      template: {
        ...app.properties?.template,
        scale: {
          minReplicas: newReplicas,
          maxReplicas: Math.max(newReplicas, 10)
        }
      }
    }
  });
}
```

---

#### 5. **Implement CostOptimizerAgent** ⏱️ 2 days
**File**: `server/agents/costOptimizerAgent.ts`

**Current**: Likely stub or incomplete

**Need**: Real Azure Cost Management API integration

```typescript
import { CostManagementClient } from '@azure/arm-costmanagement';

export class CostOptimizerAgent extends BaseAgent {
  private costClient: CostManagementClient;

  constructor() {
    super('cost-optimizer', selectModelForTask('cost-optimization'));
    this.costClient = new CostManagementClient(credentials, subscriptionId);
  }

  async analyzeUserCosts(userId: string): Promise<CostAnalysis> {
    // Query actual Azure costs for user's deployments
    const query = {
      type: 'Usage',
      timeframe: 'MonthToDate',
      dataset: {
        granularity: 'Daily',
        aggregation: { totalCost: { name: 'Cost', function: 'Sum' } },
        grouping: [{ type: 'Dimension', name: 'ResourceId' }]
      }
    };

    const result = await this.costClient.query.usage(scope, query);

    // AI analysis using Phi-4 Mini Flash (cheapest!)
    const recommendations = await this.generateRecommendations(result);

    return { currentCosts: result, recommendations, estimatedSavings };
  }
}
```

---

#### 6. **Mobile/PWA Testing & Fixes** ⏱️ 1 day

**Test On**:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

**Check**:
- [ ] All pages render correctly
- [ ] Agent chat UI usable on mobile
- [ ] Deployment flow works end-to-end
- [ ] PWA install prompt works
- [ ] Offline functionality (if any)
- [ ] Touch targets are ≥44px
- [ ] Text is readable without zooming

**Common Fixes Needed**:
```css
/* Ensure mobile-friendly touch targets */
button, a {
  min-height: 44px;
  min-width: 44px;
}

/* Fix text overflow on small screens */
.integration-card h3 {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive chat UI */
.chat-container {
  height: calc(100vh - 120px);
  height: calc(100dvh - 120px); /* Dynamic viewport height for mobile */
}
```

---

## 📋 **BACKLOG** (Post-Launch Enhancements)

### **Week 4-5: Advanced Features**

#### AWS & GCP Deployment Support
- [ ] Implement AWS ECS deployer
- [ ] Implement GCP Cloud Run deployer
- [ ] Add multi-cloud cost comparison

#### Real-time Collaboration
- [ ] WebSocket-based live deployment updates
- [ ] Shared deployment sessions (team feature)

#### Advanced Monitoring
- [ ] Custom metric dashboards
- [ ] Alerting rules (PagerDuty/Slack integration)
- [ ] Anomaly detection using AI

#### GitHub Integration
- [ ] Automatic PR creation for infrastructure changes
- [ ] CI/CD pipeline generation
- [ ] Repository analysis for security vulnerabilities

---

## 🔐 **Azure Key Vault Secrets Needed**

**Add these to Azure Key Vault** (some may not exist yet):

```bash
# GPT-5 Models
AZURE-GPT5-ENDPOINT
AZURE-GPT5-API-KEY
AZURE-GPT5-DEPLOYMENT-NAME
AZURE-GPT5-MINI-ENDPOINT
AZURE-GPT5-MINI-API-KEY
AZURE-GPT5-MINI-DEPLOYMENT-NAME

# Claude Models
AZURE-CLAUDE-ENDPOINT          # Sonnet 4.5
AZURE-CLAUDE-API-KEY
AZURE-CLAUDE-HAIKU-ENDPOINT    # Haiku 4.5
AZURE-CLAUDE-HAIKU-API-KEY

# Phi-4 Models
AZURE-PHI4-ENDPOINT
AZURE-PHI4-API-KEY
AZURE-PHI4-MINI-ENDPOINT
AZURE-PHI4-MINI-API-KEY
```

**To Add Secrets**:
```bash
az keyvault secret set --vault-name <your-vault> --name AZURE-GPT5-ENDPOINT --value "https://..."
```

---

## 📊 **Testing Checklist**

### **Before Production Launch**:

**Functionality**:
- [ ] Deploy tab works end-to-end (GitHub → Azure Container App)
- [ ] Agent Suite creates sessions without errors
- [ ] Monitoring shows real metrics (not mocks)
- [ ] Healing actually restarts/scales deployments
- [ ] Cost optimizer shows real Azure billing data
- [ ] Integrations page connects real cloud accounts

**UI/UX**:
- [ ] No scroll-to-bottom bugs
- [ ] Mobile responsive on iPhone/Android
- [ ] PWA installable
- [ ] All buttons/links work
- [ ] Error messages are helpful

**Performance**:
- [ ] Page load < 3 seconds
- [ ] API responses < 2 seconds
- [ ] Deployment completes < 5 minutes
- [ ] No memory leaks in long-running sessions

**Security**:
- [ ] No secrets exposed in client code
- [ ] Authentication works
- [ ] Authorization prevents unauthorized actions
- [ ] Rate limiting on expensive operations

---

## 💡 **Quick Wins** (Do These First)

1. **Test GPT-5 Planning** (5 min)
   - Deploy tab → "Deploy my Next.js app"
   - Verify it uses GPT-5 with reasoning

2. **Fix Monitor Mock** (30 min)
   - Replace `generateMockMetrics()` with real Azure Monitor call
   - Test with existing deployment

3. **Add MCP GitHub Server** (1 hour)
   ```bash
   npm install @modelcontextprotocol/server-github
   ```
   - Expose as MCP tool
   - Test with "analyze this repo: https://github.com/..."

4. **Mobile Test** (30 min)
   - Open on phone
   - Fix any obvious layout issues

---

## 📞 **Need Help?**

**Resources**:
- MCP Docs: https://modelcontextprotocol.io
- Azure Monitor SDK: https://learn.microsoft.com/azure/azure-monitor/
- Container Apps SDK: https://learn.microsoft.com/javascript/api/@azure/arm-appcontainers/

**Architecture Docs**:
- `docs/MCP_ARCHITECTURE.md`
- `docs/AGENT_FRAMEWORK_MIGRATION.md`

---

**Let's get this startup working! 🚀**
