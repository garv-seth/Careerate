# Careerate API Reference

**Base URL**: `https://gocareerate.com/api`  
**Authentication**: Session-based (cookies)  
**Version**: 2.0

---

## Authentication

All API endpoints require authentication except `/health` and public routes.

### Login

**Microsoft OAuth**:
```http
GET /api/login/microsoft
```

**GitHub OAuth**:
```http
GET /api/login/github
```

### Logout

```http
POST /api/logout
```

---

## Agent API

### Create Session

Create a new agent session for deployment interactions.

```http
POST /api/agent/session
```

**Request Body**:
```json
{
  "sessionType": "deployment",
  "initialContext": {
    "repositoryUrl": "https://github.com/user/repo",
    "framework": "nextjs"
  }
}
```

**Response**:
```json
{
  "success": true,
  "sessionId": "sess_abc123",
  "message": "Agent session created"
}
```

### Get Session

```http
GET /api/agent/session/:sessionId
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": "sess_abc123",
    "userId": "user_123",
    "sessionType": "deployment",
    "status": "active",
    "conversationHistory": [...],
    "createdAt": "2025-10-12T00:00:00Z"
  }
}
```

### End Session

```http
DELETE /api/agent/session/:sessionId
```

---

## Planner Agent

### Create Deployment Plan

Analyze deployment request and generate architecture plan.

```http
POST /api/agent/plan
```

**Request Body**:
```json
{
  "sessionId": "sess_abc123",
  "naturalLanguageInput": "Deploy my Next.js app to Vercel with auto-scaling",
  "repositoryUrl": "https://github.com/user/nextjs-app",
  "framework": "nextjs",
  "dependencies": ["react", "next"],
  "environmentVariables": {
    "API_KEY": "xxx"
  },
  "autonomyLevel": "supervised",
  "costLimit": 15000
}
```

**Response**:
```json
{
  "success": true,
  "plan": {
    "planId": "plan_xyz789",
    "provider": "vercel",
    "region": "global",
    "architecture": {
      "compute": "Vercel Serverless Functions",
      "database": "Vercel Postgres",
      "storage": "Vercel Blob Storage",
      "cdn": "Vercel Edge Network",
      "monitoring": "Vercel Analytics"
    },
    "scalingPolicy": {
      "minInstances": 1,
      "maxInstances": 100,
      "targetCPU": 70
    },
    "costEstimate": {
      "monthly": 2000,
      "breakdown": {
        "compute": 0,
        "database": 1500,
        "storage": 300,
        "bandwidth": 200
      }
    },
    "steps": [
      {
        "order": 1,
        "description": "Initialize project infrastructure",
        "service": "setup",
        "estimatedTime": 30
      },
      {
        "order": 2,
        "description": "Deploy to Vercel",
        "service": "deployment",
        "estimatedTime": 120
      }
    ],
    "reasoning": "I recommend Vercel for this Next.js application...",
    "securityChecks": [
      "Enable HTTPS/TLS encryption",
      "Configure CORS policies"
    ],
    "complianceChecks": [
      "GDPR compliant data storage"
    ]
  }
}
```

---

## Deployer Agent

### Execute Deployment

Execute an approved deployment plan.

```http
POST /api/agent/deploy
```

**Request Body**:
```json
{
  "sessionId": "sess_abc123",
  "planId": "plan_xyz789",
  "autonomyLevel": "supervised",
  "costLimit": 15000
}
```

**Response**:
```json
{
  "success": true,
  "deployment": {
    "deploymentId": "dep_def456",
    "currentStep": 2,
    "totalSteps": 3,
    "status": "deploying",
    "steps": [...],
    "url": null
  }
}
```

### Get Deployment Status

```http
GET /api/agent/deploy/:deploymentId/status
```

**Response**:
```json
{
  "success": true,
  "status": {
    "deploymentId": "dep_def456",
    "currentStep": 3,
    "totalSteps": 3,
    "status": "completed",
    "url": "https://app-abc123.vercel.app"
  }
}
```

### Scale Deployment

```http
POST /api/agent/deploy/:deploymentId/scale
```

**Request Body**:
```json
{
  "instances": 5,
  "sessionId": "sess_abc123",
  "autonomyLevel": "supervised"
}
```

### Stop Deployment

```http
POST /api/agent/deploy/:deploymentId/stop
```

---

## Monitor Agent

### Start Monitoring

Begin real-time monitoring of a deployment.

```http
POST /api/agent/monitor/start
```

**Request Body**:
```json
{
  "deploymentId": "dep_def456",
  "sessionId": "sess_abc123",
  "intervalSeconds": 60,
  "autonomyLevel": "supervised"
}
```

### Stop Monitoring

```http
POST /api/agent/monitor/stop
```

**Request Body**:
```json
{
  "deploymentId": "dep_def456"
}
```

### Get Metrics

```http
GET /api/agent/monitor/:deploymentId/metrics
```

**Response**:
```json
{
  "success": true,
  "metrics": {
    "deploymentId": "dep_def456",
    "status": "healthy",
    "uptime": 99.9,
    "responseTime": 125,
    "errorRate": 0.01,
    "cpuUsage": 45.2,
    "memoryUsage": 60.5,
    "requestsPerMinute": 1250,
    "timestamp": "2025-10-12T12:00:00Z"
  }
}
```

### Get Alerts

```http
GET /api/agent/monitor/:deploymentId/alerts?since=2025-10-11T00:00:00Z
```

**Response**:
```json
{
  "success": true,
  "alerts": [
    {
      "id": "alert_ghi789",
      "deploymentId": "dep_def456",
      "severity": "warning",
      "type": "high-cpu",
      "message": "CPU usage is 85.3%",
      "triggeredAt": "2025-10-12T11:45:00Z",
      "acknowledged": false
    }
  ]
}
```

---

## Healer Agent

### Diagnose and Fix

Automatically diagnose and remediate deployment issues.

```http
POST /api/agent/heal
```

**Request Body**:
```json
{
  "deploymentId": "dep_def456",
  "alert": {
    "id": "alert_ghi789",
    "type": "high-error-rate",
    "message": "Error rate is 15.2%",
    "metrics": {...}
  },
  "sessionId": "sess_abc123",
  "autonomyLevel": "fully-autonomous"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "success": true,
    "diagnosis": {
      "issue": "Error rate is 15.2%",
      "rootCause": "Application throwing exceptions due to bad deployment",
      "confidence": 0.85,
      "suggestedFix": {
        "type": "restart",
        "description": "Restart application to clear error state",
        "estimatedTime": 30,
        "riskLevel": "medium",
        "reversible": true
      },
      "reasoning": "Based on the high-error-rate alert..."
    },
    "fixApplied": true,
    "timeToFix": 32000
  }
}
```

---

## Cost Optimizer Agent

### Analyze Costs

Get detailed cost analysis and trends.

```http
GET /api/agent/cost/analyze?period=monthly&sessionId=sess_abc123&autonomyLevel=supervised
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "userId": "user_123",
    "period": "monthly",
    "totalCost": 15000,
    "breakdown": {
      "compute": 7500,
      "database": 3750,
      "storage": 1500,
      "bandwidth": 1500,
      "other": 750
    },
    "trends": {
      "change": 12.5,
      "direction": "up"
    },
    "projectedMonthlyCost": 15000,
    "budgetStatus": "under"
  }
}
```

### Get Recommendations

Get AI-powered cost optimization recommendations.

```http
GET /api/agent/cost/recommendations?sessionId=sess_abc123&autonomyLevel=supervised
```

**Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "rec_1",
      "type": "instance-sizing",
      "title": "Rightsize compute instances",
      "description": "Switch from t3.large to t3.medium instances...",
      "estimatedSavings": 4200,
      "effort": "low",
      "priority": "high",
      "autoApplicable": true
    }
  ]
}
```

### Apply Optimization

Apply a specific optimization recommendation.

```http
POST /api/agent/cost/optimize
```

**Request Body**:
```json
{
  "recommendationId": "rec_1",
  "sessionId": "sess_abc123",
  "autonomyLevel": "supervised"
}
```

### Check Budget

Check current budget status and get alerts.

```http
GET /api/agent/cost/budget
```

**Response**:
```json
{
  "success": true,
  "alert": {
    "userId": "user_123",
    "threshold": 20000,
    "currentSpend": 17500,
    "percentageUsed": 87.5,
    "timeRemaining": "7 days",
    "severity": "warning"
  },
  "message": "Budget alert triggered"
}
```

---

## Ejection API

### Eject from Provider

Eject from a cloud provider and download IaC templates.

```http
POST /api/eject/:provider/:integrationId
```

**Parameters**:
- `provider`: `aws`, `azure`, or `gcp`
- `integrationId`: Integration ID

**Response**:
```json
{
  "success": true,
  "message": "Successfully ejected from aws",
  "exports": [
    {
      "templateFormat": "cloudformation",
      "template": {...},
      "instructions": "# AWS Ejection Guide..."
    }
  ],
  "instructions": "# AWS Account Ejection - Complete Guide...",
  "revokedAt": "2025-10-12T12:00:00Z"
}
```

### Download Templates (ZIP)

Download all IaC templates as a ZIP file.

```http
GET /api/eject/:provider/:integrationId/download
```

**Response**: Binary ZIP file

**Content**:
- `README.md` - Master ejection guide
- `deployment-1/template.json` - CloudFormation/ARM template
- `deployment-1/main.tf` - Terraform config (GCP only)
- `deployment-1/README.md` - Deployment-specific instructions

### Generate IAM Template (AWS Only)

Generate CloudFormation template for IAM role setup.

```http
POST /api/eject/aws/iam-template
```

**Request Body**:
```json
{
  "externalId": "ext_abc123",
  "permissions": [
    "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "template": {
    "AWSTemplateFormatVersion": "2010-09-09",
    "Resources": {...}
  },
  "cloudFormationUrl": "https://console.aws.amazon.com/cloudformation/..."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes**:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limits

**Free Tier**:
- 100 requests/hour
- 1000 requests/day

**Pro Tier**:
- 1000 requests/hour
- 10,000 requests/day

**Enterprise**:
- Custom limits

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696838400
```

---

## Webhooks

Coming soon! Subscribe to events:
- `deployment.started`
- `deployment.completed`
- `deployment.failed`
- `alert.triggered`
- `cost.threshold_exceeded`

---

## SDKs & Libraries

**Official**:
- JavaScript/TypeScript: `npm install @careerate/sdk`
- Python: `pip install careerate-sdk`

**Community**:
- Go: `github.com/user/careerate-go`
- Ruby: `gem install careerate`

---

**Questions?** support@gocareerate.com  
**Report issues**: [GitHub Issues](https://github.com/garv-seth/CareerateV0/issues)

*Last updated: October 2025 | Version 2.0*

