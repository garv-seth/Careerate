# Technical Implementation Plan
## Multi-Cloud DevOps Runbook Platform

**Generated:** 2025-10-07  
**Objective:** Ship production-ready platform with incident auto-mitigation and blue/green deploy runbooks across Azure/AWS/GCP

---

## Current State Assessment

### ✅ Existing Infrastructure
- Multi-cloud provider abstraction (AWS/Azure/GCP service classes)
- Database with drizzle ORM + SQLite (production: Postgres)
- Basic OAuth flows (GitHub/GitLab)
- Cloud account service with credential encryption
- Autonomous deployment routes (separate from runbooks)
- React + TypeScript + Vite frontend
- Express + TypeScript backend

### ❌ Critical Gaps
1. **Provider SDKs:** All AWS/GCP/Azure service methods are MOCKED - no real SDK calls
2. **Governance:** No RBAC, approvals, audit logs, policies, budgets, kill switch
3. **Runbooks:** No incident or blue/green services/routes
4. **UI:** No runbook dashboards, approvals inbox, health cards, timeline
5. **Packages:** Missing AWS SDK packages (STS, CloudWatch, Lambda, S3, Secrets Manager); ALL GCP packages
6. **Documentation:** No admin guide, runbook guide, legal docs
7. **Sales:** No website pages, pricing, one-pagers, deck

---

## Implementation Phases

### Phase 1: Governance Foundation (Days 1-2)
**Database Schema Extensions:**
- `roles` table: Admin, Approver, Operator
- `approvals` table: requestId, runbookType, requester, approvers, status, evidence
- `audit_logs` table: immutable, who/what/when/before/after/approvals/evidence
- `policies` table: changeWindows, environmentProtections, budgetLimits, regionAllowlist
- `runbook_executions` table: planId, status, steps, metrics, errors

**Services to Create:**
- `server/services/rbacService.ts` - Role checks, permission gates
- `server/services/approvalsService.ts` - Request/approve/reject workflows
- `server/services/auditService.ts` - Immutable logging + PDF/JSON export
- `server/services/policyService.ts` - Policy evaluation engine
- `server/services/budgetService.ts` - Cost tracking and enforcement

**Package Additions:**
```json
{
  "@aws-sdk/client-sts": "^3.901.0",
  "@aws-sdk/client-cloudwatch": "^3.901.0",
  "@aws-sdk/client-lambda": "^3.901.0",
  "@aws-sdk/client-s3": "^3.901.0",
  "@aws-sdk/client-secrets-manager": "^3.901.0",
  "@aws-sdk/client-eks": "^3.901.0",
  "@google-cloud/compute": "^4.0.0",
  "@google-cloud/monitoring": "^4.0.0",
  "@google-cloud/storage": "^7.0.0",
  "@google-cloud/functions": "^3.0.0",
  "@google-cloud/secret-manager": "^5.0.0",
  "@google-cloud/container": "^5.0.0",
  "pdfkit": "^0.15.0",
  "uuid": "^11.0.0"
}
```

### Phase 2: Real Provider SDK Implementation (Days 3-5)

**AWS Services (Complete Real Implementations):**
- `AwsComputeService.ts`: EC2 SDK calls (runInstances, describeInstances, stopInstances, etc.)
- `AwsContainerService.ts`: ECS SDK calls (createService, updateService, describeServices)
- `AwsMonitoringService.ts`: CloudWatch SDK calls (getMetricStatistics, putMetricAlarm)
- `AwsStorageService.ts`: S3 SDK calls (createBucket, putObject, etc.)
- `AwsFunctionService.ts`: Lambda SDK calls (createFunction, invoke, updateFunctionCode)
- `AwsDatabaseService.ts`: RDS SDK calls (createDBInstance, describeDBInstances)
- **NEW:** `AwsCredentialService.ts`: STS AssumeRole + credential validation

**GCP Services (Complete Real Implementations):**
- `GcpContainerService.ts`: Cloud Run SDK calls (services.create, services.get)
- `GcpComputeService.ts`: Compute Engine SDK calls (instances.insert, instances.get)
- `GcpMonitoringService.ts`: Cloud Monitoring SDK calls (timeSeries.list, alertPolicies)
- `GcpStorageService.ts`: Cloud Storage SDK calls (createBucket, upload)
- `GcpFunctionService.ts`: Cloud Functions SDK calls (createFunction, call)
- `GcpDatabaseService.ts`: Cloud SQL SDK calls (instances.insert, instances.get)
- **NEW:** `GcpCredentialService.ts`: Service account validation

**Azure Services (Ensure Production-Ready):**
- Validate all Azure SDKs are complete (already partially implemented)
- Add Container Apps support for blue/green deploys
- Ensure health checks and rollback support

### Phase 3: Runbook Services (Days 6-8)

**Incident Auto-Mitigation Service:**
`server/services/runbooks/incidentAutoMitigation.ts`
```typescript
- detectIncident(provider, resource): Incident
- triageSummary(incident): TriageReport
- generateMitigationPlan(incident, dryRun): MitigationPlan
- checkPolicies(plan): PolicyCheckResult
- requestApproval(plan, requester): ApprovalRequest
- executeMitigation(approvedPlan): ExecutionResult
- verifyHealth(resource): HealthCheck
- createTicket(incident, resolution): Ticket
- sendNotifications(incident, resolution): void
- generateAuditReport(execution): AuditReport
```

**Blue/Green Deployment Service:**
`server/services/runbooks/blueGreenDeploy.ts`
```typescript
- createDeploymentPlan(spec, dryRun): DeploymentPlan
- checkPolicies(plan): PolicyCheckResult
- requestApproval(plan): ApprovalRequest
- provisionGreenEnvironment(plan): Environment
- deployToGreen(plan, greenEnv): Deployment
- runHealthChecks(greenEnv): HealthCheck
- shiftTraffic(blueEnv, greenEnv, percentage): TrafficShift
- monitorMetrics(greenEnv): Metrics
- rollback(blueEnv, greenEnv): RollbackResult
- finalizeDeployment(greenEnv, blueEnv): Finalization
- generateAuditReport(deployment): AuditReport
```

**Health & Rollback Services:**
`server/services/healthVerificationService.ts`
`server/services/rollbackOrchestrator.ts`

### Phase 4: Runbook Routes (Days 9-10)

**Incident Runbook Routes:**
`server/routes/runbooks/incident.ts`
- `POST /api/runbooks/incident/detect` - Detect incident from alerts
- `POST /api/runbooks/incident/triage` - AI triage summary
- `POST /api/runbooks/incident/:id/plan` - Generate mitigation plan (dry-run)
- `POST /api/runbooks/incident/:id/request-approval` - Request approval
- `POST /api/runbooks/incident/:id/execute` - Execute approved plan (SSE)
- `GET /api/runbooks/incident/:id/audit` - Download audit report (PDF/JSON)

**Blue/Green Routes:**
`server/routes/runbooks/bluegreen.ts`
- `POST /api/runbooks/bluegreen/plan` - Create deployment plan (dry-run + diff)
- `POST /api/runbooks/bluegreen/:id/request-approval` - Request approval
- `POST /api/runbooks/bluegreen/:id/execute` - Execute deployment (SSE)
- `POST /api/runbooks/bluegreen/:id/traffic/:percentage` - Shift traffic
- `POST /api/runbooks/bluegreen/:id/rollback` - Rollback deployment
- `GET /api/runbooks/bluegreen/:id/audit` - Download audit report

**Approvals Routes:**
`server/routes/approvals.ts`
- `GET /api/approvals` - List pending approvals (RBAC filtered)
- `POST /api/approvals/:id/approve` - Approve request
- `POST /api/approvals/:id/reject` - Reject request
- `GET /api/approvals/:id/evidence` - Get approval evidence

### Phase 5: UI Components (Days 11-13)

**Approvals Inbox:**
`client/src/pages/ApprovalsPage.tsx`
`client/src/components/approvals/ApprovalCard.tsx`
`client/src/components/approvals/ApprovalDetails.tsx`

**Runbook Dashboards:**
`client/src/pages/RunbooksPage.tsx`
`client/src/pages/IncidentRunbookPage.tsx`
`client/src/pages/BlueGreenRunbookPage.tsx`

**Health & Metrics:**
`client/src/components/runbooks/HealthCard.tsx`
`client/src/components/runbooks/DeploymentTimeline.tsx`
`client/src/components/runbooks/MetricsChart.tsx`

**Audit Viewer:**
`client/src/components/audit/AuditLogViewer.tsx`
`client/src/components/audit/AuditExportButton.tsx`

**Cloud Account Onboarding:**
`client/src/components/onboarding/CloudAccountOnboarding.tsx`
`client/src/components/onboarding/AWSConnector.tsx`
`client/src/components/onboarding/GCPConnector.tsx`
`client/src/components/onboarding/AzureConnector.tsx`

### Phase 6: Observability & Testing (Days 14-15)

**Structured Logging:**
`server/services/logging/structuredLogger.ts`
- Request ID correlation
- Trace IDs
- Action auditing

**Tests:**
- `server/services/__tests__/rbacService.test.ts`
- `server/services/__tests__/approvalsService.test.ts`
- `server/services/__tests__/incidentRunbook.test.ts`
- `server/services/__tests__/blueGreenRunbook.test.ts`
- `scripts/smoke-tests.ts` - End-to-end smoke tests
- `.github/workflows/ci.yml` - CI pipeline

### Phase 7: Documentation & Legal (Days 16-17)

**Documentation:**
- `docs/ADMIN_GUIDE.md` - Setup, RBAC, policies, kill switch
- `docs/RUNBOOK_GUIDE.md` - How to use incident and blue/green runbooks
- `docs/ONBOARDING_GUIDE.md` - Linking cloud accounts, first deployment
- `docs/API_REFERENCE.md` - All endpoints with examples

**Legal:**
- `legal/PRIVACY_POLICY.md`
- `legal/TERMS_OF_SERVICE.md`
- `legal/DPA_TEMPLATE.md`
- `legal/TRUST_SECURITY_BRIEF.md`

### Phase 8: Sales & GTM (Days 18-19)

**Website Pages:**
- `client/src/pages/HomePage.tsx` - Value prop, demo embeds, CTA
- `client/src/pages/PricingPage.tsx` - Team/Enterprise tiers
- `client/src/pages/SecurityPage.tsx` - Trust & compliance
- `client/src/pages/DemoPage.tsx` - Loom embeds

**Sales Kit:**
- `sales/ONE_PAGER_INCIDENT.md` - Incident runbook one-pager
- `sales/ONE_PAGER_BLUEGREEN.md` - Blue/green deploy one-pager
- `sales/PITCH_DECK.pdf` - 10-slide deck
- `sales/SAMPLE_AUDIT.pdf` - Redacted audit example
- `sales/KPI_SUCCESS_PLAN.md` - MTTR/failed deploys metrics

### Phase 9: Deployment & Launch (Day 20)

**Deployment:**
- Deploy to Azure Container Apps
- Run production health checks
- Verify all runbooks work end-to-end

**Launch Assets:**
- `LAUNCH.md` - Demo scripts, known limits, design-partner kit
- Production smoke test results
- Design-partner outreach template

---

## Success Criteria

### Runbooks
- ✅ Incident runbook: Detect → triage → plan → approve → execute → verify → audit
- ✅ Blue/green runbook: Plan → approve → deploy → shift traffic → rollback (if needed) → audit
- ✅ Both work on Azure/AWS/GCP with real SDKs

### Governance
- ✅ No prod writes without approval (RBAC enforced)
- ✅ Budget limits enforced with hard blocks
- ✅ Global kill switch tested and functional

### Stability
- ✅ CI green; smoke tests pass
- ✅ Observability dashboards show deployments/incidents
- ✅ Graceful failure modes with human-in-the-loop

### GTM
- ✅ Website live with pricing, demos, security page
- ✅ Sales kit complete (one-pagers, deck, audit sample)
- ✅ Design-partner outreach kit ready

---

## Risk Mitigation

### Safety First
- Default to dry-run in all environments
- Require explicit write enablement per env + approval
- Feature flags for write actions
- Least-privilege cloud credentials
- No plaintext secrets

### Performance
- Idempotent actions
- Retry logic with exponential backoff
- Circuit breakers for cloud APIs
- Rate limit awareness

### Compliance
- Log retention configuration
- PII minimization
- User data export/delete pathways
- SOC2 readiness

---

## Timeline: 20 Days to Launch

**Days 1-2:** Governance foundation  
**Days 3-5:** Provider SDK implementation  
**Days 6-8:** Runbook services  
**Days 9-10:** Runbook routes  
**Days 11-13:** UI components  
**Days 14-15:** Observability & testing  
**Days 16-17:** Documentation & legal  
**Days 18-19:** Sales & GTM  
**Day 20:** Deployment & launch  

---

**Let's ship this! 🚀**

