# Careerate Agent Architecture

**Last Updated**: October 2, 2025
**Status**: Implementation Guide for AI-Powered Deployment Orchestration

## Overview

Careerate's core intelligence comes from **Cara**, an AI agent powered by OpenAI GPT-4o with function calling. Cara analyzes user requests, determines optimal deployment strategies, and orchestrates multi-cloud infrastructure using 60+ integrated services.

## Agent Design Principles

### 1. **Permission-Based Execution**
- Agent NEVER executes deployments without explicit user confirmation
- Always explain: what will be done, why this approach, estimated costs
- User must approve before any cloud resources are provisioned

### 2. **Cost Transparency**
- Calculate and display cost estimates before deployment
- Explain pricing breakdown (compute, storage, bandwidth, etc.)
- Suggest cost-saving alternatives when available

### 3. **Intelligent Defaults**
- Recommend best-practice configurations
- Auto-detect framework and dependencies from code
- Suggest appropriate scaling policies based on app type

### 4. **Multi-Cloud Intelligence**
- Not biased toward any single cloud provider
- Choose based on: cost, performance, regional requirements, feature fit
- Explain trade-offs between options

## Agent Architecture

```
User Input (Natural Language)
       ↓
GPT-4o with Function Calling
       ↓
   [Analyze Intent]
       ↓
   [Determine Best Strategy]
       ↓
   [Calculate Costs]
       ↓
   [Ask Permission]
       ↓
   [User Confirms] ← Confirmation Required
       ↓
   [Execute Tool Calls]
       ↓
[Cloud Provider APIs via Azure SDK/AWS SDK/GCP SDK]
       ↓
[Retrieve Credentials from Azure Key Vault]
       ↓
[Provision Resources]
       ↓
[Configure Monitoring]
       ↓
[Return Production URL(s)]
```

## Function Calling Tools

Cara has access to the following tool categories:

### 1. Code Analysis Tools

**`analyze_repository`**
- **Purpose**: Detect framework, dependencies, build commands
- **Input**: GitHub repository URL or local file path
- **Output**: Framework type, runtime requirements, environment variables needed
- **Example**:
  ```json
  {
    "framework": "nextjs",
    "runtime": "nodejs20",
    "buildCommand": "npm run build",
    "startCommand": "npm start",
    "envVarsNeeded": ["DATABASE_URL", "NEXT_PUBLIC_API_URL"]
  }
  ```

**`detect_database_requirements`**
- **Purpose**: Determine if app needs database and what type
- **Input**: Repository analysis results
- **Output**: Database type (PostgreSQL, MongoDB, Redis), schema requirements
- **Example**:
  ```json
  {
    "needsDatabase": true,
    "databaseType": "postgresql",
    "estimatedSize": "< 1GB",
    "features": ["full-text search", "JSONB columns"]
  }
  ```

### 2. Deployment Strategy Tools

**`suggest_deployment_architecture`**
- **Purpose**: Recommend optimal cloud provider and services
- **Input**: App requirements, budget constraints, scaling needs
- **Output**: Deployment plan with reasoning
- **Example**:
  ```json
  {
    "primary_recommendation": {
      "frontend": {
        "provider": "Vercel",
        "reason": "Optimized for Next.js with edge network",
        "cost_estimate": "$20/month"
      },
      "database": {
        "provider": "Neon",
        "reason": "Serverless PostgreSQL scales to zero",
        "cost_estimate": "$0-50/month based on usage"
      }
    },
    "alternative": {
      "provider": "Azure Container Apps",
      "reason": "More control, integrated monitoring",
      "cost_estimate": "$30-100/month"
    }
  }
  ```

**`calculate_cost_estimate`**
- **Purpose**: Estimate monthly costs for proposed architecture
- **Input**: Deployment plan, expected traffic
- **Output**: Cost breakdown by service
- **Example**:
  ```json
  {
    "total_estimate": "$45-85/month",
    "breakdown": {
      "compute": "$20-50 (scales with traffic)",
      "database": "$15-25 (storage + queries)",
      "bandwidth": "$5-10 (CDN + egress)",
      "monitoring": "$5 (Datadog basic plan)"
    }
  }
  ```

### 3. Cloud Provider Tools

**`deploy_to_azure_container_apps`**
- **Purpose**: Deploy app to Azure Container Apps
- **Input**: Container image, environment variables, scaling config
- **Output**: Deployment status and production URL
- **Credentials**: Retrieved from Azure Key Vault (`azure-client-id`, `azure-client-secret`, `azure-tenant-id`)

**`deploy_to_aws_ecs`**
- **Purpose**: Deploy app to AWS ECS (Fargate)
- **Input**: Task definition, environment variables
- **Output**: Deployment status and ALB URL
- **Credentials**: Retrieved from Azure Key Vault (`aws-access-key-id`, `aws-secret-access-key`)

**`deploy_to_gcp_cloud_run`**
- **Purpose**: Deploy app to Google Cloud Run
- **Input**: Container image, region, environment variables
- **Output**: Deployment status and production URL
- **Credentials**: Retrieved from Azure Key Vault (`google-cloud-credentials`, `google-cloud-project-id`)

**`deploy_to_vercel`**
- **Purpose**: Deploy frontend app to Vercel
- **Input**: GitHub repository, build settings
- **Output**: Deployment status and production URL
- **Credentials**: Retrieved from Azure Key Vault (`vercel-api-token`)

**`deploy_to_railway`**
- **Purpose**: Deploy full-stack app to Railway
- **Input**: GitHub repository, environment variables
- **Output**: Deployment status and production URL
- **Credentials**: Retrieved from Azure Key Vault (`railway-api-token`)

### 4. Database Provisioning Tools

**`provision_neon_database`**
- **Purpose**: Create serverless PostgreSQL database on Neon
- **Input**: Database name, region
- **Output**: Connection string, credentials
- **Credentials**: Retrieved from Azure Key Vault (`neon-api-key`)

**`provision_azure_postgresql`**
- **Purpose**: Create Azure Database for PostgreSQL
- **Input**: Resource group, SKU, region
- **Output**: Connection string, credentials
- **Credentials**: Retrieved from Azure Key Vault (Azure credentials)

**`provision_mongodb_atlas`**
- **Purpose**: Create MongoDB cluster on Atlas
- **Input**: Cluster tier, region
- **Output**: Connection string, credentials
- **Credentials**: Retrieved from Azure Key Vault (`mongodb-atlas-api-key`)

### 5. Monitoring & Observability Tools

**`setup_datadog_monitoring`**
- **Purpose**: Configure Datadog APM and logging
- **Input**: Deployment details, log sources
- **Output**: Dashboard URL, configured alerts
- **Credentials**: Retrieved from Azure Key Vault (`datadog-api-key`, `datadog-app-key`)

**`setup_pagerduty_alerts`**
- **Purpose**: Configure incident management
- **Input**: Service definition, escalation policy
- **Output**: Integration key
- **Credentials**: Retrieved from Azure Key Vault (`pagerduty-api-key`)

### 6. Communication Tools

**`send_deployment_notification`**
- **Purpose**: Notify user via Slack/Email when deployment completes
- **Input**: Deployment status, production URL
- **Output**: Notification sent confirmation
- **Credentials**: Retrieved from Azure Key Vault (`slack-bot-token`, `sendgrid-api-key`)

## Agent Conversation Flow

### Example 1: Simple Next.js Deployment

**User**: "Deploy my Next.js app from GitHub repo github.com/user/my-app"

**Agent Reasoning**:
1. Call `analyze_repository` → Detects Next.js 14, needs Node.js 20, uses Prisma (needs PostgreSQL)
2. Call `detect_database_requirements` → PostgreSQL required
3. Call `suggest_deployment_architecture` → Recommends Vercel (frontend) + Neon (database)
4. Call `calculate_cost_estimate` → $20-50/month

**Agent Response**:
> I've analyzed your Next.js app and found it uses Prisma with PostgreSQL.
>
> **Recommended Architecture**:
> - **Frontend**: Vercel (optimized for Next.js, includes CDN)
> - **Database**: Neon Serverless PostgreSQL (scales to zero when idle)
>
> **Estimated Cost**: $20-50/month depending on traffic
> - Vercel: $20/month (Pro plan for production)
> - Neon: $0-30/month (free tier covers small apps)
>
> **What I'll do**:
> 1. Create Neon PostgreSQL database
> 2. Deploy your app to Vercel
> 3. Configure DATABASE_URL environment variable
> 4. Set up automatic redeployments from GitHub
>
> Shall I proceed?

**User**: "Yes, proceed"

**Agent Actions**:
1. Call `provision_neon_database` → Get connection string
2. Call `deploy_to_vercel` → Deploy with DATABASE_URL set
3. Call `send_deployment_notification` → Notify via Slack
4. Return production URL

**Agent Response**:
> ✅ Deployment complete!
>
> **Production URL**: https://my-app-abc123.vercel.app
>
> **Database**: PostgreSQL on Neon (careerate-myapp-prod)
> **Connection String**: postgres://user:***@ep-xyz.neon.tech/myapp
>
> Your app will automatically redeploy when you push to GitHub.

---

### Example 2: Complex E-commerce App

**User**: "I need to deploy an e-commerce site. It needs to handle 100K monthly visitors, scale automatically, stay fast globally, and keep costs under $200/month."

**Agent Reasoning**:
1. Call `analyze_repository` → Detects Next.js, uses Redis caching, PostgreSQL database
2. Call `suggest_deployment_architecture` with constraints:
   - Budget: $200/month
   - Traffic: 100K monthly visitors
   - Requirements: global CDN, auto-scaling, Redis
3. Agent determines:
   - **Option A**: Vercel + AWS RDS + ElastiCache = $180/month (but less control)
   - **Option B**: Azure Container Apps + Azure Database for PostgreSQL + Azure Cache for Redis = $150/month (more integrated)
4. Call `calculate_cost_estimate` for both options

**Agent Response**:
> I've analyzed your e-commerce app. For 100K monthly visitors with global performance, I have two recommendations:
>
> **Option A: Vercel + AWS (Best Performance)**
> - Vercel Edge Network (frontend + API routes)
> - AWS RDS PostgreSQL (db.t4g.small)
> - AWS ElastiCache Redis (cache.t4g.micro)
> - **Cost**: $180/month
> - **Pros**: Best global performance, easy scaling
> - **Cons**: Multi-cloud complexity
>
> **Option B: Azure All-in-One (Best Integration)**
> - Azure Container Apps (frontend + backend)
> - Azure Database for PostgreSQL (Burstable B2s)
> - Azure Cache for Redis (Basic C0)
> - **Cost**: $150/month
> - **Pros**: Integrated monitoring, single dashboard, $30 cheaper
> - **Cons**: Slightly slower global edge performance
>
> **My Recommendation**: Option A (Vercel + AWS) if global performance is critical. Option B (Azure) if you want simpler management and lower cost.
>
> Which would you prefer?

**User**: "Let's go with Azure for lower cost"

**Agent Actions**:
1. Call `deploy_to_azure_container_apps`
2. Call `provision_azure_postgresql`
3. Call `provision_azure_redis`
4. Call `setup_datadog_monitoring`
5. Link database and Redis to container app via environment variables
6. Return production URL

**Agent Response**:
> ✅ Azure deployment complete!
>
> **Production URL**: https://my-ecommerce-app.politetree-xyz.westus2.azurecontainerapps.io
>
> **Resources Created**:
> - Container App: my-ecommerce-app (auto-scales 1-10 replicas)
> - PostgreSQL: careerate-ecommerce-db (Burstable B2s, 32GB storage)
> - Redis: careerate-ecommerce-cache (Basic C0, 250MB)
> - Monitoring: Datadog APM enabled
>
> **Estimated Cost**: $150/month
> - Container Apps: $80/month (average load)
> - PostgreSQL: $50/month
> - Redis: $15/month
> - Datadog: $5/month (basic plan)
>
> **Next Steps**:
> - View monitoring: https://app.datadoghq.com/apm/service/my-ecommerce-app
> - Configure custom domain: Use Azure DNS or bring your own
> - Set up CI/CD: Webhook configured for auto-deploy on git push

## Decision Tree: How Agent Chooses Cloud Provider

```
Is it a static frontend app (no backend)?
  ├─ Yes → Vercel or Netlify (optimized for static/JAMstack)
  └─ No → Continue

Does it need specific regional compliance (e.g., EU data residency)?
  ├─ Yes → GCP (strongest EU presence) or Azure (good global coverage)
  └─ No → Continue

What's the primary runtime?
  ├─ Node.js/Python/Go → Flexible (any cloud)
  ├─ .NET → Azure (best .NET support)
  ├─ Java/Spring → AWS (strong Java ecosystem)
  └─ PHP → Traditional hosting or Railway

What's the scaling pattern?
  ├─ Spiky traffic (serverless) → AWS Lambda or Azure Functions
  ├─ Steady traffic (containers) → Azure Container Apps or GCP Cloud Run
  └─ High traffic (dedicated) → AWS ECS/EKS or GCP GKE

What's the budget?
  ├─ Minimal ($0-50/month) → Railway, Vercel free tier, or Azure free tier
  ├─ Moderate ($50-200/month) → Azure Container Apps or GCP Cloud Run
  └─ Enterprise ($200+/month) → AWS (most mature) or multi-cloud setup

What database is needed?
  ├─ PostgreSQL → Neon (serverless) or Azure Database for PostgreSQL
  ├─ MongoDB → MongoDB Atlas
  ├─ Redis → Azure Cache or AWS ElastiCache
  └─ No database → Simpler deployment, any provider works

Final Decision → Agent explains reasoning + cost estimate + asks permission
```

## Error Handling & Recovery

### Deployment Failures

If deployment fails, agent should:
1. **Analyze Error**: Parse error messages from cloud provider
2. **Suggest Fix**: Common issues (missing env vars, build failures, port conflicts)
3. **Retry Logic**: Automatically retry transient failures (network timeouts, rate limits)
4. **Escalate**: If unrecoverable, ask user for manual intervention

**Example**:
> ❌ Deployment failed: Azure Container Apps couldn't pull Docker image
>
> **Issue**: Azure Container Registry authentication failed
>
> **Solution**: I'll refresh the ACR credentials and retry. This should take 30 seconds.
>
> [Retrying deployment...]
>
> ✅ Retry successful! Your app is now live.

### Cost Overruns

If estimated costs are exceeded:
1. **Alert User**: Send notification via Slack/Email
2. **Suggest Optimization**: Identify cost-saving opportunities
3. **Pause Auto-Scaling**: Prevent runaway costs

**Example**:
> ⚠️ Cost Alert: Your Azure deployment is currently at $180/month (projected $240/month)
>
> **Issue**: Container App is scaling to 8-10 replicas during peak hours
>
> **Suggestions**:
> 1. Reduce max replicas from 10 to 5 (save $60/month)
> 2. Add Redis caching to reduce database load (one-time $15/month cost)
> 3. Switch to Azure CDN to offload static assets (save $20/month)
>
> Would you like me to implement these optimizations?

## Security & Credential Management

### Azure Key Vault Integration

All cloud provider credentials are stored in Azure Key Vault (`CareeerateSecretsVault`). Agent retrieves credentials at runtime using:

```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const vaultUrl = "https://careeeratesecretsV0.vault.azure.net";
const client = new SecretClient(vaultUrl, credential);

// Retrieve AWS credentials
const awsAccessKey = await client.getSecret("aws-access-key-id");
const awsSecretKey = await client.getSecret("aws-secret-access-key");
```

### Credential Rotation

- Credentials are rotated every 90 days automatically
- Agent detects expired credentials and alerts admin
- Users never see raw credentials (only masked in logs)

### Least Privilege

- Each cloud provider integration uses service accounts with minimal permissions
- Example: AWS user can only deploy to ECS, cannot delete S3 buckets

## Monitoring & Observability

### Agent Performance Metrics

Track in Datadog:
- **Tool Call Latency**: Time to execute each function
- **Success Rate**: % of deployments that succeed
- **Cost Accuracy**: Estimated vs. actual costs
- **User Satisfaction**: Feedback after each deployment

### Agent Logs

Every agent interaction logged to PostgreSQL:
```sql
CREATE TABLE agent_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER,
  message TEXT,
  agent_response TEXT,
  tools_called JSONB, -- Array of tool calls
  cost_estimate DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  deployment_status TEXT, -- pending, success, failed
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Future Enhancements

### Planned Features

1. **Multi-Agent Collaboration**:
   - DeploymentAgent (handles cloud deployments)
   - CostOptimizationAgent (suggests cost savings)
   - SecurityAgent (scans for vulnerabilities)
   - Agents can call each other for specialized tasks

2. **Learning from User Preferences**:
   - Track which cloud providers users prefer
   - Learn patterns (e.g., user always chooses cheapest option)
   - Proactively suggest based on history

3. **Advanced Cost Optimization**:
   - Auto-scale down during low-traffic hours
   - Suggest reserved instances for steady workloads
   - Spot instance recommendations for batch jobs

4. **Migration Tools**:
   - "Migrate my Heroku app to Azure" → Agent analyzes Heroku setup and replicates on Azure
   - "Move my database from RDS to Neon" → Agent handles data migration

5. **Compliance & Security**:
   - "Make this HIPAA compliant" → Agent configures encryption, logging, access controls
   - "Implement SOC 2 requirements" → Agent sets up audit logging and monitoring

## The Bottom Line

Cara is designed to be:
- **Intelligent**: Understands user intent from natural language
- **Transparent**: Explains decisions and costs before executing
- **Flexible**: Works with 60+ cloud providers and services
- **Safe**: Asks permission, handles errors gracefully, manages credentials securely

The agent's goal is to make deployment as simple as saying "deploy my app" while handling all the complexity behind the scenes.
