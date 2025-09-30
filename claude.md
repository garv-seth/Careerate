# Careerate - Natural Language Deployment Platform

## Mission
Make deployment and DevOps accessible to everyone through natural language and autonomous agents.

## What We Actually Do (v1.0 - MVP)

### Core Features (100% Functional)
1. **Natural Language Deployment**: Describe your app in plain English, we deploy it to Azure Container Apps
2. **GitHub Integration**: Connect your repo, we build and deploy automatically
3. **Health Monitoring Agent**: Autonomous agent monitors your app 24/7, restarts on failure
4. **Simple Dashboard**: View deployments, logs, and health status

### What We DON'T Do (Yet)
- Multi-cloud (Azure only for now)
- Complex microservices (monoliths only)
- Custom CI/CD pipelines (we use our standard flow)
- Enterprise migration tooling (coming later)

## Architecture (Simplified)

### Frontend
- React 18 + TypeScript
- shadcn/ui components
- Vite build
- Focus: Simple, clean deployment UI

### Backend
- Express.js + TypeScript
- PostgreSQL (Neon) for data
- Azure Container Apps for deployment
- OpenAI for natural language processing

### Deployment Flow
1. User describes app or connects GitHub repo
2. We analyze code, detect framework
3. Build Docker image
4. Deploy to Azure Container Apps
5. Monitor with health check agent
6. Auto-restart on failure

### Infrastructure
- Hosting: Azure Container Apps (primary platform)
- Registry: Azure Container Registry (for Docker images)
- Database: Neon PostgreSQL (user data)
- Auth: Azure B2C
- Monitoring: Built-in health checks + Azure Application Insights

## Key Files

### Core Services
- `server/services/deploymentManager.ts` - Real Azure deployment (NO MOCKS)
- `server/services/healthMonitor.ts` - Autonomous monitoring agent
- `server/services/githubIntegration.ts` - Repo connection & webhook handling
- `server/services/ai.ts` - Natural language processing for deployment intents

### API Routes
- `/api/hosting/intent` - Parse natural language deployment request
- `/api/hosting/deploy` - Execute deployment to Azure
- `/api/hosting/deployments/:id` - Get deployment status
- `/api/monitoring/health/:deploymentId` - Health check status

### Frontend
- `client/src/pages/vibe-coding.tsx` - Main deployment interface
- `client/src/components/DeploymentInfo.tsx` - Deployment status display
- `client/src/pages/dashboard.tsx` - User dashboard

## Environment Variables (Required)

```bash
# Database
DATABASE_URL=postgresql://...

# Azure (Critical for deployment)
AZURE_SUBSCRIPTION_ID=
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_CONTAINER_REGISTRY=careerateacr.azurecr.io

# Authentication
B2C_TENANT_NAME=careerate
B2C_SIGNUP_SIGNIN_POLICY_NAME=B2C_1_signup_signin
SESSION_SECRET=

# AI
OPENAI_API_KEY=

# GitHub Integration
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (Billing)
STRIPE_SECRET_KEY=
```

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Azure (manual for now)
docker build -t careerateacr.azurecr.io/careerate:latest .
docker push careerateacr.azurecr.io/careerate:latest
az containerapp update --name careerate-web --resource-group Careerate --image careerateacr.azurecr.io/careerate:latest
```

## Target Audience

1. **Indie Developers** - Building side projects, need production hosting
2. **Small Startups** - No DevOps engineer, need reliable deployment
3. **Non-Technical Founders** - Have an app idea, need it deployed

## Competitive Positioning

| Feature | Careerate | Replit | Vercel | Traditional DevOps |
|---------|-----------|--------|--------|-------------------|
| Natural Language Deploy | ✅ | ✅ (limited) | ❌ | ❌ |
| Production Cloud Deploy | ✅ | ❌ (sandbox) | ✅ (frontend only) | ✅ |
| Backend + Database | ✅ | ✅ | ⚠️ (limited) | ✅ |
| Auto-Monitoring | ✅ | ❌ | ⚠️ (basic) | ✅ |
| GitHub Integration | ✅ | ✅ | ✅ | ✅ |
| Price (monthly) | $49 | $20 | $20 | $5,000-10,000 |

## Pricing Model

- **Free Beta**: First 100 users, 90 days free
- **Indie**: $49/month - 3 apps, monitoring, GitHub integration
- **Pro**: $149/month - 10 apps, priority support
- **Enterprise**: $499/month - Unlimited, white-label, SLA

Target: 1,000 paying users = $49K-149K MRR by month 6

## Current Status

**What Works:**
- ✅ User authentication (Azure B2C)
- ✅ Project management (CRUD)
- ✅ Code generation (OpenAI)
- ✅ Subscription billing (Stripe)

**What We're Building (This Sprint):**
- 🔨 Real Azure Container Apps deployment
- 🔨 Health monitoring agent (autonomous)
- 🔨 GitHub webhook integration
- 🔨 End-to-end deployment flow

**What's Removed (Scope Cut):**
- ❌ Multi-agent orchestration (over-engineered)
- ❌ Enterprise migration tools (future product)
- ❌ Multi-cloud support (Azure only for MVP)
- ❌ Custom AI training (unnecessary complexity)

## Success Metrics

**Month 1 (Launch):**
- 100 beta signups
- 20 successful deployments
- 0 critical bugs

**Month 3 (PMF Search):**
- 500 total users
- 100 paying users ($4,900 MRR)
- 90% deployment success rate
- <5 minute average deployment time

**Month 6 (Growth):**
- 2,000 total users
- 500 paying users ($24,500 MRR)
- 95% deployment success rate
- Customer testimonials & case studies

## Notes for Claude Code

- Focus on ONE user journey: "Deploy my app" → working production URL with monitoring
- Every feature must be 100% functional, no mocks or simulations
- When in doubt, simplify - MVP first, features later
- Test the full deployment flow before considering anything "done"