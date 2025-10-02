# Careerate Codebase Cleanup Plan

## 🎯 Goal: Keep ONLY what's needed for GTM

### ✅ KEEP (Essential for GTM)

#### Frontend Pages:
- ✅ `landing-new.tsx` - Landing page
- ✅ `dashboard.tsx` - Main user dashboard
- ✅ `deploy.tsx` - **Core feature** - GitHub/Manual deployment
- ✅ `integrations.tsx` - Cloud accounts & GitHub connection
- ✅ `account-settings.tsx` - User settings
- ✅ `payment.tsx` - Billing/Stripe
- ✅ `not-found.tsx` - 404 page
- ✅ `PrivacyPolicy.tsx` - Legal (required)
- ✅ `TermsOfService.tsx` - Legal (required)

#### Backend Services:
- ✅ `azureContainerApps.ts` - **Core feature** - Deployment
- ✅ `cloudAccountService.ts` - **New** - Cloud account linking
- ✅ `githubService.ts` - **New** - GitHub integration
- ✅ `ai.ts` - Code generation & intent parsing
- ✅ `storage.ts` - Database layer
- ✅ `subscriptionService.ts` - Billing
- ✅ `sseService.ts` - Real-time events
- ✅ `deploymentEventService.ts` - Deployment events
- ✅ `healthMonitor.ts` - App health checks

---

### ❌ REMOVE (Not needed for GTM - Future features)

#### Frontend Pages (10 files):
- ❌ `AdminDashboard.tsx` - Admin features (future)
- ❌ `BillingDashboard.tsx` - Duplicate of payment page
- ❌ `monitoring-dashboard.tsx` - Advanced monitoring (future)
- ❌ `integrations-setup.tsx` - Duplicate functionality
- ❌ `enterprise-migration.tsx` - Enterprise feature (future)
- ❌ `editor.tsx` - Code editor (not core GTM feature)
- ❌ `devops-dashboard.tsx` - Advanced DevOps (future)
- ❌ `enterprise-dashboard.tsx` - Enterprise (future)
- ❌ `landing.tsx` - OLD landing page (we use landing-new.tsx)
- ❌ `github-import.tsx` - Functionality in deploy.tsx now
- ❌ `vibe-coding.tsx` - Advanced AI coding (future)
- ❌ `launch-wizard.tsx` - Onboarding wizard (nice-to-have)
- ❌ `privacy-settings.tsx` - Advanced settings (future)
- ❌ `IntegrationsPage.tsx` - Duplicate (we use integrations.tsx)

#### Backend Services:
- ❌ `agentManager.ts` - Advanced AI agents (future)
- ❌ `enhancedAgentManager.ts` - Advanced AI (future)
- ❌ `legacyAssessment.ts` - Enterprise migration (future)
- ❌ `integrationService.ts` - Duplicate of cloudAccountService
- ❌ `repositoryIntegrationService.ts` - Duplicate of githubService
- ❌ `apiConnectorFramework.ts` - Over-engineered (future)
- ❌ `encryptionService.ts` - Duplicate of cloudAccountService encryption
- ❌ `collaborationServer.ts` - Real-time collab (future)
- ❌ `usageTrackingMiddleware.ts` - Over-engineered tracking (basic needed only)

#### Routes:
- ❌ `/agents/*` routes - Future feature
- ❌ `/migration/*` routes - Enterprise feature
- ❌ `/enterprise/*` routes - Future feature
- ❌ `/devops/*` routes - Future feature
- ❌ `/monitoring/*` routes - Future feature
- ❌ `/editor/*` routes - Not core GTM

---

## 🔥 Deletion Strategy (Conservative)

### Phase 1: Frontend Pages (Safe)
Delete 14 unused page files:
```bash
# These are NOT imported in App.tsx or used in core workflow
rm client/src/pages/AdminDashboard.tsx
rm client/src/pages/BillingDashboard.tsx
rm client/src/pages/monitoring-dashboard.tsx
rm client/src/pages/integrations-setup.tsx
rm client/src/pages/enterprise-migration.tsx
rm client/src/pages/editor.tsx
rm client/src/pages/devops-dashboard.tsx
rm client/src/pages/enterprise-dashboard.tsx
rm client/src/pages/landing.tsx
rm client/src/pages/github-import.tsx
rm client/src/pages/vibe-coding.tsx
rm client/src/pages/launch-wizard.tsx
rm client/src/pages/privacy-settings.tsx
rm client/src/pages/IntegrationsPage.tsx
```

### Phase 2: Backend Services (Cautious)
Delete 9 unused service files:
```bash
# Check for imports first!
rm server/services/agentManager.ts
rm server/services/enhancedAgentManager.ts
rm server/services/legacyAssessment.ts
rm server/services/integrationService.ts
rm server/services/repositoryIntegrationService.ts
rm server/services/apiConnectorFramework.ts
rm server/services/encryptionService.ts
rm server/services/collaborationServer.ts
```

### Phase 3: Update App.tsx (Critical)
Remove unused imports and routes

### Phase 4: Update routes.ts (Critical)
Remove unused API endpoints

---

## ⚠️ CAUTION: Keep for now (might be dependencies)

- `secretsManager` - Used by integration services?
- `usageTrackingMiddleware` - Used in routes.ts
- `stripe` integration - Used for billing

---

## 🧪 Testing After Cleanup

1. ✅ Landing page loads
2. ✅ Login works
3. ✅ Dashboard loads
4. ✅ Deploy page loads with GitHub tab
5. ✅ Integrations page loads
6. ✅ Payment page loads
7. ✅ Build succeeds (`npm run build`)
8. ✅ No import errors
9. ✅ Routes work

---

## 📊 Impact

**Before:**
- Frontend Pages: 23 files
- Backend Services: ~20+ files
- Confusing for future AI agents

**After:**
- Frontend Pages: ~9 files (60% reduction)
- Backend Services: ~10 files (50% reduction)
- Clear, focused codebase

**Risk Level:** LOW
- All deleted files are NOT used in current GTM workflow
- Git rollback available: `git reset --hard 017af71`
