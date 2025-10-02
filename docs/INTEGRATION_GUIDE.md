# Careerate Integration Guide

**Last Updated**: October 2, 2025
**Status**: Complete mapping of 60+ integrations stored in Azure Key Vault

## Overview

Careerate has pre-configured integrations with major cloud providers, databases, monitoring services, and communication tools. All credentials are securely stored in **Azure Key Vault** (`CareeerateSecretsVault`) and retrieved at runtime by the Cara agent.

**Azure Key Vault URL**: `https://careeeratesecretsvault.vault.azure.net`

## Integration Categories

### Cloud Providers (Compute & Hosting)

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **AWS** | `aws-access-key-id`<br>`aws-secret-access-key` | Deploy to ECS, Lambda, S3 | `deploy_to_aws_ecs`<br>`deploy_to_aws_lambda` |
| **Azure** | `azure-client-id`<br>`azure-client-secret`<br>`azure-tenant-id`<br>`azure-subscription-id` | Deploy to Container Apps, Functions | `deploy_to_azure_container_apps`<br>`deploy_to_azure_functions` |
| **Google Cloud** | `google-cloud-credentials`<br>`google-cloud-project-id` | Deploy to Cloud Run, Cloud Functions | `deploy_to_gcp_cloud_run`<br>`deploy_to_gcp_cloud_functions` |
| **Vercel** | `vercel-api-token` | Deploy frontend apps | `deploy_to_vercel` |
| **Railway** | `railway-api-token` | Deploy full-stack apps | `deploy_to_railway` |
| **Fly.io** | `fly-api-token` | Global app deployment | `deploy_to_flyio` |

**Usage Example** (AWS):
```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { ECS } from "@aws-sdk/client-ecs";

// Retrieve AWS credentials from Key Vault
const awsAccessKey = await keyVaultClient.getSecret("aws-access-key-id");
const awsSecretKey = await keyVaultClient.getSecret("aws-secret-access-key");

// Initialize AWS SDK
const ecsClient = new ECS({
  region: "us-west-2",
  credentials: {
    accessKeyId: awsAccessKey.value,
    secretAccessKey: awsSecretKey.value
  }
});
```

---

### Version Control Systems

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **GitHub** | `github-client-id`<br>`github-client-secret`<br>`github-webhook-secret` | OAuth, repository access, webhooks | `analyze_github_repository`<br>`setup_github_webhook` |
| **GitLab** | `gitlab-client-id`<br>`gitlab-client-secret`<br>`gitlab-webhook-secret` | OAuth, repository access, CI/CD | `analyze_gitlab_repository`<br>`setup_gitlab_webhook` |

**Usage Example** (GitHub):
```typescript
// OAuth flow for GitHub repository access
const githubClientId = await keyVaultClient.getSecret("github-client-id");
const githubClientSecret = await keyVaultClient.getSecret("github-client-secret");

const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId.value}&scope=repo,read:user`;
// Redirect user to authUrl for authorization
```

---

### Databases

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **Neon** | `neon-api-key` | Serverless PostgreSQL | `provision_neon_database` |
| **Azure Database for PostgreSQL** | Uses Azure credentials | Managed PostgreSQL | `provision_azure_postgresql` |
| **MongoDB Atlas** | `mongodb-atlas-api-key`<br>`mongodb-atlas-public-key`<br>`mongodb-atlas-private-key` | Managed MongoDB | `provision_mongodb_atlas` |
| **Azure CosmosDB** | `cosmosdb-connection-string` | Multi-model NoSQL | `provision_cosmosdb` |
| **PlanetScale** | `planetscale-api-token` | Serverless MySQL | `provision_planetscale_database` |

**Usage Example** (Neon):
```typescript
import { neon } from '@neondatabase/serverless';

const neonApiKey = await keyVaultClient.getSecret("neon-api-key");

// Create new Neon database
const response = await fetch('https://console.neon.tech/api/v2/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${neonApiKey.value}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    project: {
      name: 'careerate-user-db',
      region_id: 'aws-us-west-2'
    }
  })
});
```

---

### Caching & Storage

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **Azure Cache for Redis** | Uses Azure credentials | Managed Redis | `provision_azure_redis` |
| **AWS ElastiCache** | Uses AWS credentials | Managed Redis/Memcached | `provision_aws_elasticache` |
| **Azure Blob Storage** | `azure-storage-connection-string` | Object storage | `setup_blob_storage` |
| **AWS S3** | Uses AWS credentials | Object storage | `setup_s3_bucket` |
| **Google Cloud Storage** | Uses GCP credentials | Object storage | `setup_gcs_bucket` |

---

### Monitoring & Observability

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **Datadog** | `datadog-api-key`<br>`datadog-app-key` | APM, logs, metrics | `setup_datadog_monitoring` |
| **PagerDuty** | `pagerduty-api-key` | Incident management | `setup_pagerduty_alerts` |
| **Sentry** | `sentry-dsn` | Error tracking | `setup_sentry_monitoring` |
| **LogRocket** | `logrocket-app-id` | Session replay | `setup_logrocket` |

**Usage Example** (Datadog):
```typescript
const datadogApiKey = await keyVaultClient.getSecret("datadog-api-key");
const datadogAppKey = await keyVaultClient.getSecret("datadog-app-key");

// Configure Datadog agent on container
const datadogConfig = {
  DD_API_KEY: datadogApiKey.value,
  DD_APP_KEY: datadogAppKey.value,
  DD_SITE: 'datadoghq.com',
  DD_SERVICE: 'careerate-user-app',
  DD_ENV: 'production'
};
```

---

### Communication Services

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **SendGrid** | `sendgrid-api-key` | Transactional email | `send_deployment_notification_email` |
| **Twilio** | `twilio-account-sid`<br>`twilio-auth-token` | SMS, voice | `send_sms_notification` |
| **Slack** | `slack-bot-token`<br>`slack-webhook-url` | Team notifications | `send_slack_notification` |
| **Discord** | `discord-webhook-url` | Community notifications | `send_discord_notification` |

**Usage Example** (Slack):
```typescript
const slackBotToken = await keyVaultClient.getSecret("slack-bot-token");

// Send deployment notification to Slack
await fetch('https://slack.com/api/chat.postMessage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${slackBotToken.value}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    channel: '#deployments',
    text: `✅ Deployment complete: ${appUrl}`
  })
});
```

---

### AI & Machine Learning

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **OpenAI** | `openai-api-key` | GPT-4o, embeddings | Used by Cara agent directly |
| **Anthropic** | `anthropic-api-key` | Claude API | Alternative to OpenAI |
| **Azure AI Foundry** | `azure-ai-foundry-endpoint`<br>`azure-ai-foundry-key` | Custom AI models | `deploy_custom_ai_model` |
| **Hugging Face** | `huggingface-api-token` | Open-source models | `deploy_huggingface_model` |

---

### Search & Data Services

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **BraveSearch** | `bravesearch-api-key` | Web search API | Used for market research tools |
| **Firecrawl** | `firecrawl-api-key` | Web scraping | Used for competitor analysis |
| **Browserbase** | `browserbase-api-key` | Headless browsers | Used for testing deployments |

---

### Authentication & Identity

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **Azure B2C** | `b2c-client-id`<br>`b2c-client-secret`<br>`b2c-tenant-name`<br>`b2c-signup-signin-policy` | User authentication | Used by platform directly |
| **Auth0** | `auth0-client-id`<br>`auth0-client-secret`<br>`auth0-domain` | Alternative auth provider | Can be used if user prefers Auth0 |

---

### Payment Processing

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **Stripe** | `stripe-secret-key`<br>`stripe-webhook-secret`<br>`stripe-publishable-key` | Subscription billing | Used by platform billing system |

---

### CDN & Edge

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **Cloudflare** | `cloudflare-api-token`<br>`cloudflare-zone-id` | CDN, DDoS protection | `setup_cloudflare_cdn` |
| **Azure CDN** | Uses Azure credentials | Microsoft CDN | `setup_azure_cdn` |
| **AWS CloudFront** | Uses AWS credentials | Amazon CDN | `setup_cloudfront_cdn` |

---

### Container Registries

| Service | Key Vault Secrets | Purpose | Agent Tool |
|---------|------------------|---------|------------|
| **Azure Container Registry** | `azure-container-registry-url`<br>`azure-container-registry-username`<br>`azure-container-registry-password` | Docker image storage | Used by deployment pipeline |
| **AWS ECR** | Uses AWS credentials | Docker image storage | Used for AWS deployments |
| **Google Artifact Registry** | Uses GCP credentials | Docker image storage | Used for GCP deployments |

---

## How Agent Uses Integrations

### 1. Credential Retrieval

Every agent tool that needs credentials follows this pattern:

```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const vaultUrl = "https://careeeratesecretsvault.vault.azure.net";
const client = new SecretClient(vaultUrl, credential);

async function getIntegrationCredentials(serviceName: string) {
  const secrets = {
    aws: ['aws-access-key-id', 'aws-secret-access-key'],
    azure: ['azure-client-id', 'azure-client-secret', 'azure-tenant-id'],
    gcp: ['google-cloud-credentials', 'google-cloud-project-id'],
    // ... etc
  };

  const secretNames = secrets[serviceName];
  const credentials = {};

  for (const secretName of secretNames) {
    const secret = await client.getSecret(secretName);
    credentials[secretName] = secret.value;
  }

  return credentials;
}
```

### 2. Integration Selection Logic

When user requests deployment, agent follows this decision tree:

```
User: "Deploy my app"
  ↓
Agent: Analyze repository → Framework detected
  ↓
Agent: What deployment needs exist?
  ├─ Compute (app hosting)
  ├─ Database (if needed)
  ├─ Caching (if needed)
  ├─ CDN (for static assets)
  └─ Monitoring (always recommended)
  ↓
Agent: Which provider is best for each?
  ├─ Consider: cost, performance, regional requirements
  ├─ Check: user preferences (from history)
  └─ Suggest: primary + alternative options
  ↓
Agent: Calculate total cost estimate
  ↓
Agent: Ask user permission with explanation
  ↓
User: Approves
  ↓
Agent: Retrieve credentials from Key Vault
  ↓
Agent: Execute deployment
  ├─ Call cloud provider APIs
  ├─ Configure monitoring
  └─ Set up notifications
  ↓
Agent: Return production URL + monitoring dashboard link
```

### 3. Multi-Service Orchestration

For complex deployments, agent coordinates multiple integrations:

**Example**: E-commerce app deployment
1. **AWS ECS** (compute) - runs containerized app
2. **Neon** (database) - PostgreSQL for product catalog
3. **AWS ElastiCache** (caching) - Redis for session storage
4. **Cloudflare** (CDN) - cache static assets globally
5. **Datadog** (monitoring) - APM and logs
6. **SendGrid** (email) - order confirmations
7. **Slack** (notifications) - deployment alerts

Agent retrieves credentials for all 7 services and orchestrates deployment.

## Security Best Practices

### 1. Credential Rotation
- All credentials rotated every 90 days
- Agent automatically detects expired credentials
- Alerts sent to admin for manual rotation

### 2. Least Privilege
- Each service account has minimum required permissions
- Example: AWS IAM user can deploy to ECS but cannot delete S3 buckets

### 3. Audit Logging
- Every credential access logged to Azure Monitor
- Alerts triggered for unusual access patterns

### 4. Encryption at Rest
- All Key Vault secrets encrypted with AES-256
- Encryption keys managed by Azure Key Vault

### 5. No Credential Exposure
- Credentials never logged in plaintext
- Masked in all UI displays (e.g., `sk-***abc123`)
- Not included in error messages

## Adding New Integrations

To add a new integration:

1. **Store credentials in Key Vault**:
   ```bash
   az keyvault secret set \
     --vault-name CareeerateSecretsVault \
     --name new-service-api-key \
     --value "your-api-key-here"
   ```

2. **Create agent tool function** in `server/services/integrations/`:
   ```typescript
   export async function deployToNewService(config: DeploymentConfig) {
     const apiKey = await getSecret("new-service-api-key");
     // Implementation
   }
   ```

3. **Add tool schema** to agent configuration:
   ```typescript
   {
     name: "deploy_to_new_service",
     description: "Deploy app to NewService platform",
     parameters: {
       type: "object",
       properties: {
         appName: { type: "string" },
         region: { type: "string" }
       }
     }
   }
   ```

4. **Test integration**:
   ```bash
   npm run test:integration -- new-service
   ```

5. **Document** in this guide

## Integration Status

### Production-Ready ✅
- Azure Container Apps
- GitHub OAuth
- OpenAI (Cara agent)
- Stripe (billing)
- Neon (databases)

### Configured, Not Yet Wired 🔄
- AWS ECS/Lambda
- GCP Cloud Run
- Vercel
- Railway
- Datadog
- SendGrid
- Twilio
- Slack

### Planned 📋
- Heroku migration tool
- Kubernetes (EKS, AKS, GKE)
- Custom domain automation
- SSL certificate management

## Complete Integration List

All 60+ integrations available in Azure Key Vault:

```
Cloud Providers:
├─ aws-access-key-id
├─ aws-secret-access-key
├─ azure-client-id
├─ azure-client-secret
├─ azure-tenant-id
├─ azure-subscription-id
├─ google-cloud-credentials
├─ google-cloud-project-id
├─ vercel-api-token
├─ railway-api-token
├─ fly-api-token
└─ render-api-token

Version Control:
├─ github-client-id
├─ github-client-secret
├─ github-webhook-secret
├─ gitlab-client-id
├─ gitlab-client-secret
└─ gitlab-webhook-secret

Databases:
├─ neon-api-key
├─ mongodb-atlas-api-key
├─ mongodb-atlas-public-key
├─ mongodb-atlas-private-key
├─ planetscale-api-token
├─ cosmosdb-connection-string
└─ supabase-api-key

Monitoring:
├─ datadog-api-key
├─ datadog-app-key
├─ pagerduty-api-key
├─ sentry-dsn
└─ logrocket-app-id

Communication:
├─ sendgrid-api-key
├─ twilio-account-sid
├─ twilio-auth-token
├─ slack-bot-token
├─ slack-webhook-url
└─ discord-webhook-url

AI Services:
├─ openai-api-key
├─ anthropic-api-key
├─ azure-ai-foundry-endpoint
├─ azure-ai-foundry-key
└─ huggingface-api-token

Search & Data:
├─ bravesearch-api-key
├─ firecrawl-api-key
└─ browserbase-api-key

Authentication:
├─ b2c-client-id
├─ b2c-client-secret
├─ b2c-tenant-name
├─ auth0-client-id
├─ auth0-client-secret
└─ auth0-domain

Payment:
├─ stripe-secret-key
├─ stripe-webhook-secret
└─ stripe-publishable-key

CDN:
├─ cloudflare-api-token
└─ cloudflare-zone-id

Storage:
├─ azure-storage-connection-string
├─ firebase-credentials
└─ aws-s3-bucket-name

Container Registries:
├─ azure-container-registry-url
├─ azure-container-registry-username
└─ azure-container-registry-password
```

---

**Total Integrations**: 60+
**Production Ready**: 5
**In Development**: 15
**Planned**: 40+

This comprehensive integration ecosystem is what makes Careerate the most flexible deployment platform—agent chooses the best service for each use case, not forcing users into a single cloud vendor.
