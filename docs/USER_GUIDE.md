# Careerate User Guide

**Version**: 2.0  
**Last Updated**: October 2025

Welcome to Careerate! This guide will help you get started with AI-powered cloud deployments.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Connecting Cloud Accounts](#connecting-cloud-accounts)
3. [Deploying Your First App](#deploying-your-first-app)
4. [Agent Autonomy Levels](#agent-autonomy-levels)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Cost Management](#cost-management)
7. [Ejection Guide](#ejection-guide)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Quick Start (5 minutes)

1. **Sign up** at [gocareerate.com](https://gocareerate.com)
2. **Connect a cloud account** (AWS, Azure, or GCP)
3. **Deploy an app** using natural language
4. **Monitor** your deployment in real-time

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Cloud account (AWS, Azure, or GCP)
- Credit card for cloud billing (billed directly by cloud provider)

---

## Connecting Cloud Accounts

Careerate deploys to **your cloud accounts**, not ours. This means:

✅ **You retain full control** of your infrastructure  
✅ **You're billed directly** by your cloud provider (AWS, Azure, GCP)  
✅ **You can eject anytime** and keep your deployments running

### AWS Connection

**What happens**:
1. Careerate generates a CloudFormation template with an IAM role
2. You create the stack in your AWS account
3. Careerate uses cross-account access to deploy resources
4. You remain the owner of all infrastructure

**Steps**:

1. Go to **Integrations** → **Connect AWS**
2. Click **Download CloudFormation Template**
3. Open [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation)
4. Click **Create Stack** → **Upload a template file**
5. Upload the template, review permissions
6. Create the stack
7. Copy the **Role ARN** from stack outputs
8. Paste into Careerate → **Complete Connection**

**Permissions granted**:
- Amazon ECS (container deployments)
- AWS Lambda (serverless functions)
- Amazon RDS (databases)
- Amazon S3 (storage)
- CloudWatch (monitoring)
- Secrets Manager (credentials)

**Security**:
- Uses ExternalId for secure cross-account access
- No permanent credentials stored
- You can revoke access anytime by deleting the stack

### Azure Connection

**What happens**:
1. OAuth flow creates a Service Principal in your Azure AD
2. You grant Contributor permissions to specific resource groups
3. Careerate deploys using the Service Principal
4. You retain ownership

**Steps**:

1. Go to **Integrations** → **Connect Azure**
2. Click **Sign in with Microsoft**
3. Authorize Careerate to access your subscription
4. Select subscription and resource groups
5. Connection complete!

**Permissions granted**:
- Contributor role on selected resource groups
- Read access to subscription for cost tracking

### GCP Connection

**What happens**:
1. OAuth flow or Service Account JSON upload
2. You grant Cloud Run, Cloud SQL, and Storage permissions
3. Careerate deploys to your project
4. You retain ownership

**Steps**:

**Option A: OAuth (Recommended)**

1. Go to **Integrations** → **Connect GCP**
2. Click **Sign in with Google**
3. Select your GCP project
4. Grant requested permissions
5. Connection complete!

**Option B: Service Account JSON**

1. Create a Service Account in GCP Console
2. Grant roles: Cloud Run Admin, Cloud SQL Admin, Storage Admin
3. Generate and download JSON key
4. Upload to Careerate
5. Connection complete!

---

## Deploying Your First App

### Natural Language Deployment

**Example 1: Simple Next.js App**

```
Deploy my Next.js app to Vercel. 
Repository: github.com/myuser/my-nextjs-app
Use environment variables from .env.local
Enable auto-scaling
```

**What Careerate does**:
1. Analyzes your repository
2. Detects Next.js framework
3. Recommends Vercel (optimized for Next.js)
4. Estimates cost (~$20/month)
5. Asks for your approval
6. Deploys in 2-3 minutes

**Example 2: Full-Stack App**

```
Deploy my Node.js + React app to AWS.
Backend: Express API on port 5000
Frontend: Vite build in /client/dist
Database: PostgreSQL
Region: us-east-1
Budget limit: $150/month
```

**What Careerate does**:
1. Creates VPC and subnets
2. Provisions RDS PostgreSQL
3. Deploys backend to ECS Fargate
4. Deploys frontend to S3 + CloudFront
5. Configures auto-scaling (1-10 instances)
6. Sets up monitoring and alerts

### Deployment Steps

1. **Go to Deploy** → **New Deployment**
2. **Enter description** in natural language
3. **Review plan** (architecture, cost estimate, steps)
4. **Adjust autonomy level** (supervised, semi-autonomous, fully autonomous)
5. **Approve and deploy**
6. **Watch progress** in real-time

### Deployment Status

Track your deployment:
- ✅ **Completed** - App is live
- 🔄 **Deploying** - In progress
- ⚠️ **Degraded** - Issues detected
- ❌ **Failed** - Deployment error (rollback initiated)

---

## Agent Autonomy Levels

Careerate uses AI agents to manage your deployments. You control how much autonomy they have.

### Supervised Mode (Default, Recommended)

**How it works**:
- Agent asks permission for **every action**
- You review and approve each step
- Safest option for production

**Best for**:
- First-time users
- Production deployments
- High-stakes applications

**Example**:
```
Agent: I want to create an RDS PostgreSQL instance (db.t3.micro, $15/month). Approve?
You: ✅ Yes / ❌ No
```

### Semi-Autonomous Mode

**How it works**:
- Agent auto-executes **low-risk actions**
- Asks for approval on **high-risk actions** (e.g., resources > $50/month, database changes)
- Balanced approach

**Best for**:
- Experienced users
- Staging environments
- Iterative development

**Example**:
```
Agent: Created S3 bucket (low-risk, auto-approved)
Agent: About to create NAT Gateway ($32/month). Approve?
You: ✅ Yes / ❌ No
```

### Fully Autonomous Mode

**How it works**:
- Agent executes **all actions** without asking
- Notifies you after completion
- Fast but risky

**⚠️ WARNING**: Use at your own risk!
- Careerate is **not liable** for agent errors
- You are **responsible** for all cloud costs
- Monitor your cloud bills closely
- Set strict budget limits

**Best for**:
- Development environments
- Trusted applications
- Users comfortable with risk

**Example**:
```
Agent: Deployment complete. Created:
  - ECS Cluster (3 instances, $120/month)
  - RDS PostgreSQL (db.t3.medium, $75/month)
  - CloudFront CDN ($10/month)
Total: $205/month
```

### Changing Autonomy Level

Go to **Settings** → **Agent Autonomy** → Select level

Changes apply to future deployments only.

---

## Monitoring & Alerts

### Real-Time Monitoring

**Metrics tracked**:
- Uptime (%)
- Response time (ms)
- Error rate (%)
- CPU usage (%)
- Memory usage (%)
- Requests per minute

**Dashboard**: Go to **Monitoring** → Select deployment

### Alerts

**Alert types**:
- 🔴 **Critical**: Downtime, high error rate (>10%), high costs
- ⚠️ **Warning**: Slow response (>1s), high CPU (>80%)
- ℹ️ **Info**: Deployment updates, scaling events

**Notification channels**:
- Email (default)
- SMS (Twilio, configure in Settings)
- Slack (webhook URL)
- Discord (webhook URL)

### Auto-Healing

In **Fully Autonomous** mode, Careerate can auto-fix issues:

**Healer Agent** diagnoses and remediates:
- High error rates → Restart application
- High CPU/memory → Scale up
- Slow response times → Clear cache
- Database connection issues → Reconnect

**Confidence threshold**: Only auto-fixes if >80% confident

---

## Cost Management

### Cost Tracking

**Real-time estimates**:
- View projected monthly cost before deploying
- Live updates as architecture changes
- Breakdown by service (compute, database, storage, bandwidth)

**Budget alerts**:
- Set monthly budget limit
- Receive alerts at 80%, 90%, 100% usage
- Agent pauses at 100% (Fully Autonomous mode)

### Cost Optimization

Go to **Cost Optimizer** → **Get Recommendations**

**Example recommendations**:
1. **Rightsize instances**: Switch from t3.large to t3.medium (save $42/month)
2. **Reserved capacity**: Commit to 1-year instances (save $60/month, 40% discount)
3. **Storage tiers**: Move infrequent data to cold storage (save $15/month)
4. **Auto-scaling**: Scale down during off-hours (save $30/month)
5. **Spot instances**: Use for batch jobs (save $21/month, 70% discount)

**Apply optimizations**:
- Low-risk: Auto-applicable
- Medium-risk: Requires approval
- High-risk: Requires manual review

---

## Ejection Guide

### Why Eject?

You might want to remove Careerate but keep your infrastructure:
- Cost savings (no platform fee)
- Full manual control
- Company policy requirements
- Trying Careerate temporarily

### What You Lose

After ejection, you lose:
- ❌ Natural language deployments
- ❌ AI-powered cost optimization
- ❌ Auto-healing for issues
- ❌ Real-time monitoring dashboard
- ❌ Multi-cloud intelligence

You'll need to:
- ✅ Manage infrastructure manually (AWS Console, Azure Portal, GCP Console)
- ✅ Set up your own monitoring (Datadog, New Relic, CloudWatch)
- ✅ Handle scaling and updates yourself
- ✅ Debug issues without AI assistance

### Ejection Process

**Steps**:

1. **Go to Integrations** → Select cloud provider → **Eject**
2. **Download templates** (CloudFormation, ARM, or Terraform)
3. **Review warning modal** → Confirm ejection
4. **Careerate revokes access** (deletes IAM role/Service Principal)
5. **Your infrastructure keeps running** (zero downtime)
6. **Manage manually** going forward

**What you receive**:
- Infrastructure as Code (IaC) templates for all deployments
- Step-by-step management guide
- Instructions for updates, scaling, deletion

**Example (AWS)**:
- CloudFormation templates for each deployment
- `README.md` with management instructions
- Resources remain in your AWS account

### Re-connecting

Changed your mind? You can reconnect anytime:
1. Go to **Integrations** → **Connect [Provider]**
2. Follow connection steps again
3. Careerate re-imports existing deployments
4. Resume AI management

No infrastructure changes needed!

---

## Troubleshooting

### Common Issues

**1. "Deployment failed at step X"**

**Solution**:
- Check deployment logs (click deployment → View Logs)
- Common causes: Missing environment variables, insufficient permissions, quota limits
- Try rollback (click **Rollback** button)
- Contact support if persistent

**2. "High cloud costs detected"**

**Solution**:
- Check **Cost Optimizer** for recommendations
- Scale down unused instances
- Delete old deployments
- Set budget alerts for future

**3. "Agent not responding"**

**Solution**:
- Refresh page
- Check agent session status (**Settings** → **Active Sessions**)
- End stale sessions
- Create new deployment session

**4. "OAuth connection failed"**

**Solution**:
- Ensure you're logged into the correct cloud account
- Check browser cookies are enabled
- Try incognito mode
- Verify cloud account permissions

**5. "Deployment is slow"**

**Solution**:
- Check cloud provider status pages (AWS, Azure, GCP)
- Some steps take 5-10 minutes (e.g., database provisioning)
- Monitor progress bar for current step
- Contact support if stuck >30 minutes

### Getting Help

**Support channels**:
- 📧 Email: support@gocareerate.com
- 💬 Discord: [discord.gg/careerate](https://discord.gg/careerate)
- 📚 Docs: [docs.gocareerate.com](https://docs.gocareerate.com)
- 🐛 GitHub Issues: [github.com/careerate/issues](https://github.com/garv-seth/CareerateV0/issues)

**Include in support requests**:
- Deployment ID
- Error message (full text)
- Screenshots
- Steps to reproduce

**Response times**:
- Free tier: 24-48 hours
- Pro tier: 12-24 hours
- Enterprise tier: <4 hours (SLA)

---

## Best Practices

### Security

✅ **Do**:
- Use separate AWS/Azure/GCP accounts for dev/staging/prod
- Rotate secrets regularly
- Enable MFA on cloud accounts
- Review agent actions in Supervised mode

❌ **Don't**:
- Share Careerate account credentials
- Use Fully Autonomous mode without budget limits
- Store sensitive data in environment variables (use Secrets Manager)
- Grant more permissions than needed

### Cost Optimization

✅ **Do**:
- Start with small instances, scale up as needed
- Use auto-scaling to match demand
- Delete unused deployments
- Review Cost Optimizer recommendations monthly

❌ **Don't**:
- Over-provision "just in case"
- Keep dev environments running 24/7
- Ignore budget alerts
- Use expensive instance types for testing

### Agent Usage

✅ **Do**:
- Start with Supervised mode
- Gradually increase autonomy as you gain confidence
- Set budget limits for Fully Autonomous mode
- Review agent logs periodically

❌ **Don't**:
- Jump straight to Fully Autonomous
- Ignore agent warnings
- Deploy without cost estimates
- Blame agents for your mistakes (they're tools, you're responsible)

---

## FAQ

**Q: How is Careerate different from Vercel/Heroku?**

A: We deploy to **your cloud accounts** (AWS, Azure, GCP), not ours. You retain full control and can eject anytime. Plus, we use AI for natural language deployments and cost optimization.

**Q: Do you charge for deployments?**

A: No platform fees currently (beta). You only pay your cloud provider directly (AWS, Azure, GCP). Future pricing TBD.

**Q: Can I use multiple cloud providers?**

A: Yes! Connect AWS, Azure, and GCP. Our Planner Agent recommends the best provider for each app.

**Q: What happens if Careerate shuts down?**

A: Your infrastructure keeps running. You own it. Download IaC templates via ejection and manage manually.

**Q: Is my data secure?**

A: Yes. Credentials encrypted with AES-256-GCM in Azure Key Vault. SOC 2 compliant infrastructure. No access to your data.

**Q: Can I self-host Careerate?**

A: Not currently, but we're open-source! See [GitHub](https://github.com/garv-seth/CareerateV0).

---

**Need more help?** Contact support@gocareerate.com

**Found a bug?** Report at [github.com/careerate/issues](https://github.com/garv-seth/CareerateV0/issues)

**Want to contribute?** We're open-source! PRs welcome.

---

*Last updated: October 2025 | Version 2.0*

