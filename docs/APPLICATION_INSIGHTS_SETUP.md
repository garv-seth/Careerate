# Application Insights Setup Guide

**Date**: October 12, 2025  
**Purpose**: Enterprise-grade monitoring and observability for Careerate  
**Status**: Code Ready, Requires Azure Configuration

---

## Overview

Azure Application Insights provides:
- ✅ Real-time application monitoring
- ✅ Performance metrics and diagnostics
- ✅ Exception tracking and alerts
- ✅ Dependency tracking (DB, APIs, external services)
- ✅ Custom events and metrics
- ✅ Live metrics stream
- ✅ Distributed tracing (W3C standard)

---

## Prerequisites

1. Azure subscription
2. Resource group (`careerate-rg`)
3. Azure CLI or Azure Portal access

---

## Setup Steps

### 1. Create Application Insights Resource

#### Via Azure Portal:
1. Navigate to Azure Portal
2. Search for "Application Insights"
3. Click "Create"
4. Fill in details:
   - **Name**: `careerate-appinsights`
   - **Resource Group**: `careerate-rg`
   - **Region**: `West US 2` (same as Container Apps)
   - **Mode**: Workspace-based
5. Click "Review + Create"
6. Copy the **Connection String**

#### Via Azure CLI:
```bash
# Create Application Insights
az monitor app-insights component create \
  --app careerate-appinsights \
  --location westus2 \
  --resource-group careerate-rg \
  --workspace /subscriptions/{subscription-id}/resourcegroups/careerate-rg/providers/microsoft.operationalinsights/workspaces/careerate-logs

# Get connection string
az monitor app-insights component show \
  --app careerate-appinsights \
  --resource-group careerate-rg \
  --query connectionString -o tsv
```

---

### 2. Configure Environment Variables

Add to Azure Container App environment variables:

```bash
# Enable Application Insights
az containerapp update \
  --name careerate-web \
  --resource-group careerate-rg \
  --set-env-vars \
    "APPINSIGHTS_ENABLED=true" \
    "APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://..."
```

Or manually in Azure Portal:
1. Go to Container App → Configuration → Environment variables
2. Add:
   - `APPINSIGHTS_ENABLED` = `true`
   - `APPINSIGHTS_CONNECTION_STRING` = `<your-connection-string>`

---

### 3. Store in Key Vault (Recommended)

```bash
# Store in Key Vault
az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name APPINSIGHTS-CONNECTION-STRING \
  --value "InstrumentationKey=xxx;IngestionEndpoint=https://..."

# Update Container App to use Key Vault reference
az containerapp update \
  --name careerate-web \
  --resource-group careerate-rg \
  --set-env-vars \
    "APPINSIGHTS_CONNECTION_STRING=secretref:APPINSIGHTS-CONNECTION-STRING"
```

---

## Features Implemented

### Automatic Collection:
- ✅ HTTP requests (all API calls)
- ✅ HTTP responses (status codes, duration)
- ✅ Exceptions and errors
- ✅ Dependencies (database, external APIs)
- ✅ Performance counters (CPU, memory)
- ✅ Console logs

### Custom Tracking:
- ✅ Custom events
- ✅ Custom metrics
- ✅ User actions
- ✅ Deployment events
- ✅ Agent executions
- ✅ API call telemetry

---

## Usage Examples

### Track Custom Event:
```typescript
import { trackEvent } from './services/applicationInsights';

trackEvent('UserSignup', {
  provider: 'github',
  userId: user.id,
});
```

### Track Metric:
```typescript
import { trackMetric } from './services/applicationInsights';

trackMetric('DeploymentDuration', durationMs, {
  provider: 'aws',
  region: 'us-east-1',
});
```

### Track Exception:
```typescript
import { trackException } from './services/applicationInsights';

try {
  // ... code
} catch (error) {
  trackException(error as Error, {
    context: 'DeploymentProcess',
    deploymentId: deployment.id,
  });
}
```

### Track Deployment:
```typescript
import { trackDeployment } from './services/applicationInsights';

trackDeployment(
  deployment.id,
  'completed',
  'aws',
  durationMs
);
```

### Track Agent Execution:
```typescript
import { trackAgentExecution } from './services/applicationInsights';

trackAgentExecution(
  'PlannerAgent',
  'analyzeIntent',
  true,
  executionTime
);
```

---

## Viewing Data

### Azure Portal:
1. Navigate to Application Insights resource
2. Explore:
   - **Live Metrics**: Real-time data
   - **Application Map**: Dependencies visualization
   - **Performance**: Request/response times
   - **Failures**: Exceptions and errors
   - **Users**: User behavior
   - **Custom Events**: Your tracked events

### Queries (Log Analytics):
```kusto
// All requests in last 24h
requests
| where timestamp > ago(24h)
| project timestamp, name, duration, resultCode

// Failed requests
requests
| where success == false
| project timestamp, name, resultCode, problemId

// Custom events
customEvents
| where name == "Deployment"
| extend status = tostring(customDimensions.status)
| summarize count() by status

// Performance metrics
customMetrics
| where name == "DeploymentDuration"
| summarize avg(value), min(value), max(value)
```

---

## Alerts Configuration

### Recommended Alerts:

#### 1. High Error Rate:
```
Failed requests > 10 in 5 minutes
Action: Email + Teams notification
```

#### 2. Slow Response Time:
```
Average response time > 3 seconds for 5 minutes
Action: Email to ops team
```

#### 3. Exception Spike:
```
Exceptions > 20 in 5 minutes
Action: PagerDuty alert
```

#### 4. Dependency Failure:
```
Database calls failing > 50%
Action: Critical alert
```

---

## Sampling Configuration

Current settings (in code):
- **Development**: 100% (all telemetry)
- **Production**: 50% (reduce volume, cut costs)

To adjust:
```typescript
// In applicationInsights.ts
telemetryClient.config.samplingPercentage = 50; // 50%
```

---

## Cost Optimization

### Data Retention:
- Default: 90 days
- Can extend to 730 days (extra cost)

### Volume Control:
- Use sampling (50% in production)
- Filter noisy endpoints
- Use daily cap (configure in Portal)

### Estimated Cost:
- First 5GB/month: FREE
- Beyond 5GB: ~$2.30/GB
- Typical usage: 2-5GB/month (small app)

---

## Troubleshooting

### Issue: No data appearing

**Check**:
1. `APPINSIGHTS_ENABLED` = `true`
2. `APPINSIGHTS_CONNECTION_STRING` is correct
3. Container App has restarted after env var change
4. Check console for `[AppInsights] ✅ Initialized successfully`

### Issue: Too much data

**Solutions**:
1. Increase sampling percentage (reduce telemetry)
2. Filter specific request paths
3. Set daily cap in Portal

### Issue: Missing custom events

**Check**:
1. `telemetryClient` is initialized
2. Event tracking called after initialization
3. Flush telemetry on app shutdown

---

## Integration Points

### Current Integrations:
- ✅ Server initialization (`server/index.ts`)
- ✅ Custom tracking service (`server/services/applicationInsights.ts`)

### Planned Integrations:
- [ ] Agent executions (track performance)
- [ ] Deployment lifecycle (track success/failure)
- [ ] API endpoint tracking (automatic)
- [ ] User actions (frontend events)
- [ ] Error boundaries (React errors)

---

## Security

### Data Privacy:
- ✅ No PII (Personally Identifiable Information) tracked by default
- ✅ Connection string stored in Key Vault
- ✅ Data encrypted in transit and at rest
- ✅ Role-based access control (Azure RBAC)

### Compliance:
- ✅ GDPR compliant (data residency in EU if needed)
- ✅ SOC 2 certified
- ✅ HIPAA compliant (Business Associate Agreement available)

---

## Next Steps

1. **Create Application Insights resource** in Azure
2. **Copy connection string**
3. **Add to Container App environment variables**
4. **Restart Container App**
5. **Verify telemetry** in Azure Portal
6. **Configure alerts** for critical scenarios
7. **Set up dashboards** for monitoring

---

## Documentation Links

- [Application Insights Overview](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Node.js SDK](https://docs.microsoft.com/azure/azure-monitor/app/nodejs)
- [Query Language (Kusto)](https://docs.microsoft.com/azure/data-explorer/kusto/query/)
- [Pricing](https://azure.microsoft.com/pricing/details/monitor/)

---

**Status**: ✅ Code Implemented, Awaiting Azure Configuration  
**Action Required**: Manual Azure setup by user  
**Estimated Time**: 10-15 minutes

🎯 **Enterprise-grade monitoring ready to deploy!**

