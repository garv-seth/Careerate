# URGENT: Azure Deployment Cache Fix

## Problem
Azure Container Apps is stuck serving old revisions despite new code being deployed. The Vite hash `index-VZ3LYhEt.js` hasn't changed in 15+ deployments because old containers are still running.

## What Was Fixed
✅ **React Hydration Error** - Fixed `window.location.hash` access during SSR in `dashboard.tsx`
✅ **Code Committed** - Commit `0690090` pushed to main
✅ **GitHub Actions Running** - New Docker image building now

## What You Must Do NOW

### Option 1: Run PowerShell Cleanup Script (RECOMMENDED)

```powershell
# Navigate to project directory
cd C:\Users\Garvs\CareerateV0

# Run the cleanup script
.\scripts\force-clean-deploy.ps1
```

This script will:
1. ✅ Deactivate all old revisions
2. ✅ Delete all ACR images (force fresh build)
3. ✅ Build new Docker image with no cache
4. ✅ Deploy with new revision
5. ✅ Set 100% traffic to new revision
6. ✅ Verify deployment

### Option 2: Manual Commands (If Script Fails)

Run these commands ONE BY ONE in PowerShell:

```powershell
# 1. Check if Azure CLI is logged in
az account show

# 2. Delete ALL old images from ACR (NUCLEAR OPTION)
az acr repository delete --name careerateacr --repository careerate-app --yes

# 3. Deactivate ALL old revisions
az containerapp revision list --name careerate-web --resource-group Careerate --query "[?properties.active==``true``].name" -o tsv | ForEach-Object { az containerapp revision deactivate --name careerate-web --resource-group Careerate --revision $_ }

# 4. Wait for GitHub Actions to finish building (check https://github.com/garv-seth/CareerateV0/actions)

# 5. Once build is done, force traffic to latest revision
$LATEST = az containerapp revision list --name careerate-web --resource-group Careerate --query "sort_by([?properties.active==``true``], &properties.createdTime)[-1].name" -o tsv
az containerapp ingress traffic set --name careerate-web --resource-group Careerate --revision-weight "$LATEST=100"

# 6. Verify deployment
az containerapp show --name careerate-web --resource-group Careerate --query "properties.template.containers[0].image"
```

### Option 3: Let GitHub Actions Deploy Naturally

If you want to wait for GitHub Actions to finish:

1. **Check build status**: https://github.com/garv-seth/CareerateV0/actions
2. **Wait for "Deploy to Azure Container Apps" to complete** (~5-7 minutes)
3. **THEN run cleanup**:

```powershell
# Get latest revision name
$LATEST = az containerapp revision list --name careerate-web --resource-group Careerate --query "sort_by([?properties.active==``true``], &properties.createdTime)[-1].name" -o tsv

# Set 100% traffic to latest revision
az containerapp ingress traffic set --name careerate-web --resource-group Careerate --revision-weight "$LATEST=100"

# Verify
az containerapp revision list --name careerate-web --resource-group Careerate --query "[].{Name:name, Active:properties.active, Traffic:properties.trafficWeight}" -o table
```

## Verification Steps

After running cleanup, verify the fix:

### 1. Check Deployed Commit SHA
```powershell
curl https://careerate-web.politetree-6f564ad5.westus2.azurecontainerapps.io/api/health | ConvertFrom-Json | Select-Object gitCommit
```

**Expected**: `0690090` (the hydration fix commit)

### 2. Check Vite Hash Changed
```powershell
curl https://careerate-web.politetree-6f564ad5.westus2.azurecontainerapps.io
```

Look for new JS file hashes (NOT `index-VZ3LYhEt.js`)

### 3. Test in Browser
1. Open **Incognito/Private window**: https://gocareerate.com/dashboard#agent
2. Open **DevTools Console** (F12)
3. You should see **NO ERRORS**
4. Old error was: `NotFoundError: Failed to execute 'removeChild' on 'Node'`

## Why This Happened

Azure Container Apps has **revision-based deployment** with traffic splitting. When you deploy:
1. New revision is created
2. **Old revisions keep running** (traffic split or zero-downtime)
3. Without explicit traffic routing, old code stays live
4. The `:latest` tag doesn't force Container Apps to pull new images

## Prevention for Future

Update `.github/workflows/deploy.yml` to **always route 100% traffic to latest revision**:

```yaml
- name: Force traffic to latest revision
  run: |
    LATEST=$(az containerapp revision list \
      --name careerate-web \
      --resource-group Careerate \
      --query "sort_by([?properties.active==\`true\`], &properties.createdTime)[-1].name" -o tsv)

    az containerapp ingress traffic set \
      --name careerate-web \
      --resource-group Careerate \
      --revision-weight "$LATEST=100"
```

Add this step AFTER the "Deploy to Azure Container Apps" step in the workflow.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `az containerapp revision list --name careerate-web --resource-group Careerate -o table` | See all revisions and traffic % |
| `az acr repository show-tags --name careerateacr --repository careerate-app` | See all Docker image tags |
| `az containerapp show --name careerate-web -g Careerate --query "properties.template.containers[0].image"` | See currently deployed image |
| `curl https://gocareerate.com/api/health \| jq .gitCommit` | See deployed git commit |

---

**Last Updated**: 2025-10-07
**Fix Commit**: `0690090`
**Status**: ⏳ Waiting for manual Azure cleanup
