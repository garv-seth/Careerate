# Careerate - Natural Language Deployment Platform

## Mission
Make deployment accessible to everyone through natural language and Azure cloud infrastructure.

## What We Actually Do (v1.0 - Production Ready)

### Core Features (100% Functional)
1. **Natural Language Deployment**: Describe your app in plain English → get a production URL on Azure
2. **Automated Containerization**: We detect your framework and create optimized Docker containers
3. **Azure Container Apps**: Production hosting with auto-scaling and 99.9% uptime SLA
4. **Health Monitoring**: Basic health checks and monitoring for deployed apps
5. **Simple Dashboard**: View your deployments, URLs, and status

### What Works Right Now
- ✅ Natural language intent parsing (GPT-4o)
- ✅ Automated Docker image building (Azure Container Registry)
- ✅ Production deployment to Azure Container Apps
- ✅ Custom domains with SSL
- ✅ Auto-scaling (scale-to-zero capable)
- ✅ Basic health monitoring
- ✅ User authentication (Azure B2C)
- ✅ Subscription billing (Stripe)

### What We DON'T Do (Yet)
- ❌ GitHub integration (planned for v1.1)
- ❌ Live logs streaming (basic logs only)
- ❌ Advanced monitoring & alerting
- ❌ Multi-cloud support (Azure only)
- ❌ Team collaboration features
- ❌ CI/CD pipeline customization

## Architecture

### Frontend
- React 18 + TypeScript
- shadcn/ui components
- Vite build system
- Simple, clean deployment interface at `/deploy`

### Backend
- Express.js + TypeScript
- PostgreSQL (Neon) for user data and deployment records
- Azure Container Apps for app hosting
- Azure Container Registry for Docker images
- OpenAI GPT-4o for natural language processing

### Deployment Flow
1. User describes app in natural language (or provides basic config)
2. GPT-4o parses intent and extracts requirements
3. System generates appropriate Dockerfile
4. Azure Container Registry builds Docker image
5. Azure Container Apps provisions and deploys container
6. User receives production URL (https://[app-name].azurecontainerapps.io)
7. Basic health monitoring starts automatically

### Infrastructure
- **Hosting**: Azure Container Apps (Consumption plan)
- **Registry**: Azure Container Registry (Basic tier)
- **Database**: Neon PostgreSQL (for Careerate platform data)
- **Auth**: Azure B2C
- **AI**: OpenAI GPT-4o
- **Billing**: Stripe

## Key Files

### Core Services
- `server/services/azureContainerApps.ts` - **Real Azure deployment** (NO MOCKS)
- `server/services/ai.ts` - Natural language intent parsing
- `server/routes.ts` - API endpoints including deployment routes
- `server/storage.ts` - Database operations

### API Routes
- `POST /api/hosting/intent` - Parse natural language deployment request
- `POST /api/hosting/deploy` - Execute deployment to Azure Container Apps
- `GET /api/hosting/deployments/:id` - Get deployment status

### Frontend
- `client/src/pages/deploy.tsx` - **Main deployment interface** (simple, focused UI)
- `client/src/pages/dashboard.tsx` - User dashboard
- `client/src/pages/landing-new.tsx` - Landing page

### Configuration
- `Dockerfile` - Production build configuration for Careerate platform itself
- `.env` - Environment variables (NOT in git)
- `package.json` - Dependencies and scripts

## Environment Variables (Required)

```bash
# Database
DATABASE_URL=postgresql://...

# Azure (Critical for deployment functionality)
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_CONTAINER_REGISTRY=careerateacr
AZURE_RESOURCE_GROUP=Careerate
AZURE_CONTAINER_APPS_ENV=careerate-agents-env
AZURE_LOCATION=westus2

# Authentication
B2C_TENANT_NAME=careerate
B2C_SIGNUP_SIGNIN_POLICY_NAME=B2C_1_signup_signin
SESSION_SECRET=your-session-secret

# AI
OPENAI_API_KEY=your-openai-api-key

# Billing
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server (http://localhost:5000)
npm run dev

# Build for production
npm run build

# Deploy Careerate platform to Azure
az acr build --registry careerateacr --image careerate-app:latest .
az containerapp update --name careerate-web --resource-group Careerate --image careerateacr.azurecr.io/careerate-app:latest
```

## Target Audience

1. **Indie Developers** - Building side projects, need simple deployment
2. **Small Startups** - No DevOps engineer, need production hosting
3. **Non-Technical Founders** - Have an app (or idea), need it deployed

## Competitive Positioning

| Feature | Careerate | Vercel | Heroku | Railway |
|---------|-----------|--------|--------|---------|
| Natural Language Deploy | ✅ | ❌ | ❌ | ❌ |
| Backend Support | ✅ | ⚠️ | ✅ | ✅ |
| Frontend Support | ✅ | ✅ | ⚠️ | ✅ |
| Enterprise Cloud | ✅ (Azure) | ✅ | ✅ (AWS) | ⚠️ |
| Price (Starter) | $29 | $20 | $50 | $20 |
| Price (Business) | $199 | $400 | $500 | $100 |

**Our Differentiation:**
1. **Only platform with true natural language deployment**
2. **Azure-backed** - enterprise-ready infrastructure
3. **Simpler pricing** - no compute-hour calculations
4. **Full-stack** - backend + frontend in one place

## Pricing Model

- **Starter**: $29/month - 3 apps, monitoring, support
- **Pro**: $79/month - 10 apps, GitHub integration, priority support
- **Business**: $199/month - 50 apps, SSO, SLA
- **Enterprise**: Custom - Unlimited apps, white-label, on-premise

See `BUSINESS-STRATEGY.md` for detailed pricing analysis and unit economics.

## Current Status (September 30, 2025)

**✅ Production Ready:**
- Platform deployed at gocareerate.com
- Deployment engine fully functional
- User authentication working
- Billing integration complete
- Basic monitoring operational

**🚀 Launch Ready:**
- MVP feature complete
- Infrastructure stable
- Pricing validated
- Business model defined

**📋 Immediate Roadmap (Next 30 Days):**
- Public launch (Product Hunt, Reddit, HN)
- GitHub integration for auto-deploy
- Enhanced monitoring dashboard
- Email support system
- Referral program

## Success Metrics

**Month 1 (Launch):**
- 1,000 signups
- 100 paying customers
- $5K MRR
- 95%+ deployment success rate

**Month 3 (Product-Market Fit):**
- 5,000 total users
- 500 paying customers
- $30K MRR
- <10% monthly churn

**Month 12 (Scale):**
- 20,000 total users
- 2,000 paying customers
- $120K MRR ($1.4M ARR)
- Enterprise sales motion established

## Technical Constraints & Limitations

**Current Limitations:**
- **Azure Only**: No AWS/GCP support (yet)
- **Basic Monitoring**: Health checks only, no APM/tracing
- **Manual GitHub**: No automated CI/CD from repos (yet)
- **Single Region**: West US 2 only
- **Framework Detection**: Node.js, React, Next.js supported; others via custom Dockerfile

**Known Issues:**
- Deploy UI doesn't show real-time build logs (polls status instead)
- No rollback functionality
- No blue-green deployments
- Limited environment variable management

**Performance:**
- Average deployment time: 3-5 minutes
- Build time: 2-4 minutes (depends on app size)
- Container startup: 30-60 seconds

## Notes for Development

### Key Principles
1. **One User Journey**: "Deploy my app" → working production URL
2. **No Mocks**: Every feature must be 100% functional
3. **Simple First**: MVP features before advanced capabilities
4. **Test Everything**: Full deployment flow must work end-to-end

### Testing Deployments

```bash
# Test with a simple Node.js app
npx tsx test-real-deployment.ts
```

This creates a test Express app, deploys it to Azure, and returns a live URL.

### Debugging Deployments

```bash
# Check Container App status
az containerapp show --name [app-name] --resource-group Careerate

# View logs
az containerapp logs show --name [app-name] --resource-group Careerate --type console

# Check build status
az acr task list-runs --registry careerateacr --top 5
```

## Business Documents

- `BUSINESS-STRATEGY.md` - Complete business plan, pricing analysis, financial projections
- `PITCH-DECK.md` - Investor pitch deck content
- `CLAUDE.md` - This file (technical + product overview)

---

## The Bottom Line

**What We Promise:**
- Simple natural language deployment
- Production-ready Azure hosting
- Basic monitoring
- Fast, reliable infrastructure

**What We Deliver:**
- ✅ All of the above, fully functional
- ✅ Real Azure Container Apps (not a toy)
- ✅ SSL, custom domains, auto-scaling
- ✅ 99.9% uptime on Azure's infrastructure

**What We Don't Promise:**
- Multi-cloud (maybe later)
- Advanced DevOps features (maybe later)
- AI code generation (focus is deployment, not coding)
- Enterprise migration (different product)

---

*Last Updated: September 30, 2025*
*Status: Production Ready, Launch Imminent*
