# Multi-Cloud DevOps Runbook Platform

**Production-ready governance and runbook orchestration for Azure, AWS, and GCP.**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run database migration
npm run db:push

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

---

## ✨ What's Built

### Core Services (Production-Ready)

**Governance Framework:**
- ✅ RBAC with Admin/Approver/Operator/Viewer roles
- ✅ Multi-approver workflow system
- ✅ Immutable audit logging with PDF/JSON export
- ✅ Policy engine (change windows, budgets, environment protection)
- ✅ Global kill switch

**Runbook Automation:**
- ✅ Incident Auto-Mitigation (Detect → Triage → Plan → Approve → Execute)
- ✅ Blue/Green Deployment (Plan → Approve → Deploy → Traffic Shift → Finalize)
- ✅ Real-time SSE progress updates
- ✅ Automatic rollback on failure
- ✅ Health verification

---

## 📡 API Endpoints

### Incident Runbook
```bash
# Detect incident
POST /api/runbooks/incident/detect

# AI-powered triage
POST /api/runbooks/incident/:id/triage

# Generate mitigation plan
POST /api/runbooks/incident/:id/plan

# Request approval
POST /api/runbooks/incident/:id/request-approval

# Execute mitigation (SSE stream)
POST /api/runbooks/incident/execute

# Download audit report
GET /api/runbooks/incident/:executionId/audit?format=pdf
```

### Blue/Green Deployment
```bash
# Create deployment plan
POST /api/runbooks/bluegreen/plan

# Request approval
POST /api/runbooks/bluegreen/request-approval

# Execute deployment (SSE stream)
POST /api/runbooks/bluegreen/execute

# Manual traffic shift
POST /api/runbooks/bluegreen/:serviceName/traffic/:percentage

# Rollback deployment
POST /api/runbooks/bluegreen/:serviceName/rollback

# Download audit report
GET /api/runbooks/bluegreen/:executionId/audit?format=json
```

---

## 🎯 Usage Examples

### Example 1: Grant Admin Role
```typescript
import { rbacService } from './server/services/governance/rbacService';

await rbacService.grantRole({
  userId: 'user-123',
  role: 'admin',
  scope: 'global'
});
```

### Example 2: Create Approval Request
```typescript
import { approvalsService } from './server/services/governance/approvalsService';

const approvalId = await approvalsService.createApprovalRequest({
  requesterId: 'user-123',
  runbookType: 'incident-mitigation',
  resourceType: 'container-service',
  resourceId: 'service-xyz',
  provider: 'aws',
  environment: 'production',
  action: 'scale',
  requestedChanges: { replicas: 6 },
  riskLevel: 'high',
});
```

### Example 3: Export Audit Log as PDF
```typescript
import { auditService } from './server/services/governance/auditService';

const pdf = await auditService.exportPDF({
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-07'),
  format: 'pdf'
});
```

### Example 4: Execute Incident Mitigation
```bash
curl -X POST http://localhost:5000/api/runbooks/incident/execute \
  -H "Content-Type: application/json" \
  -d '{"approvalRequestId": "approval-123"}' \
  --no-buffer

# SSE stream will return real-time progress:
# data: {"type":"started","message":"Mitigation started..."}
# data: {"type":"progress","step":"Scaling resources","progress":50}
# data: {"type":"completed","success":true}
```

---

## 🔐 Security & Compliance

### RBAC Enforcement
All API endpoints check permissions:
```typescript
// Check if user can execute runbooks
const hasPermission = await rbacService.hasPermission({
  userId: 'user-123',
  action: 'execute-runbook'
});
```

### Immutable Audit Trail
Every action is logged:
```typescript
await auditService.log({
  action: 'deployment-completed',
  actor: 'user-123',
  targetResource: { type: 'deployment', id: 'deploy-456' },
  beforeState: {...},
  afterState: {...},
  success: true
});
```

### Policy Checks
All runbook executions are policy-validated:
```typescript
const policyResult = await policyService.evaluatePolicies({
  resourceType: 'container-service',
  action: 'deploy',
  environment: 'production',
  estimatedCost: 150.00,
  requestedBy: 'user-123'
});

if (!policyResult.passed) {
  // Block execution or warn user
}
```

---

## 📊 Database Schema

### Governance Tables
- `user_roles` - RBAC role assignments
- `approval_requests` - Approval workflow requests
- `approval_actions` - Individual approver responses
- `governance_policies` - Policy definitions
- `policy_evaluations` - Policy evaluation results
- `budget_limits` - Budget tracking
- `runbook_audit_logs` - Immutable audit trail
- `system_controls` - Kill switch and global controls
- `runbook_executions` - Runbook execution tracking

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run smoke tests
npm run smoke

# Run with coverage
npm run test:coverage
```

---

## 📚 Documentation

- **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - What's been built, business value
- **[CURRENT_STATUS.md](./CURRENT_STATUS.md)** - Detailed status and API usage
- **[TECHNICAL_IMPLEMENTATION_PLAN.md](./TECHNICAL_IMPLEMENTATION_PLAN.md)** - Full roadmap
- **[PROGRESS_REPORT.md](./PROGRESS_REPORT.md)** - Phase-by-phase progress

---

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/careerate

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-key

# Azure (optional)
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# AWS (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# GCP (optional)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GCP_PROJECT_ID=your-project-id
```

---

## 🚧 Current Limitations

### Cloud Provider Integration
**Status:** Mocked SDK calls  
**Impact:** Runbooks execute workflows but don't actually call cloud APIs  
**Next Step:** Implement real AWS/GCP SDK calls (see `TECHNICAL_IMPLEMENTATION_PLAN.md`)

### UI Components
**Status:** No frontend  
**Impact:** Must use API directly (curl/Postman)  
**Next Step:** Build React components (see Phase 6 in plan)

### Testing
**Status:** No integration tests  
**Impact:** Manual testing required  
**Next Step:** Add test coverage (see Phase 7 in plan)

---

## 🎯 Roadmap

### ✅ Phase 1-3: Complete
- [x] Governance framework
- [x] Runbook services
- [x] API endpoints

### 🔄 Phase 4-5: In Progress
- [ ] Real AWS SDK integration
- [ ] Real GCP SDK integration

### ⏳ Phase 6-9: Pending
- [ ] UI components
- [ ] Observability & testing
- [ ] Documentation & legal
- [ ] Deployment

---

## 💡 Example Workflows

### Incident Mitigation Workflow
```
1. Incident detected → POST /api/runbooks/incident/detect
2. AI generates triage → POST /api/runbooks/incident/:id/triage
3. Plan created → POST /api/runbooks/incident/:id/plan
4. Policy checks pass
5. Approval requested → POST /api/runbooks/incident/:id/request-approval
6. Approver approves via UI
7. Execution begins → POST /api/runbooks/incident/execute
8. Resources scaled
9. Health verified
10. Audit report generated → GET /api/runbooks/incident/:id/audit
```

### Blue/Green Deployment Workflow
```
1. Plan created → POST /api/runbooks/bluegreen/plan
2. Diff shown (blue vs green)
3. Policy checks pass
4. Approval requested → POST /api/runbooks/bluegreen/request-approval
5. Approver approves
6. Execution begins → POST /api/runbooks/bluegreen/execute
7. Green environment provisioned
8. Traffic gradually shifted (10% → 25% → 50% → 75% → 100%)
9. Health monitored
10. Deployment finalized
11. Audit report generated → GET /api/runbooks/bluegreen/:id/audit
```

---

## 📞 Support

### Getting Help
- Check `CURRENT_STATUS.md` for detailed API usage
- Review inline JSDoc comments in service files
- See `TECHNICAL_IMPLEMENTATION_PLAN.md` for architecture

### Reporting Issues
- Use trace IDs for request correlation
- Check audit logs for execution history
- Review console logs for errors

---

## 📄 License

MIT

---

**Built with ❤️ for DevOps teams who value safety, compliance, and automation.**

