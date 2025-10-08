# Force Clean Azure Deployment - Nuclear Option
# This script completely cleans Azure Container Apps and ACR, then forces a fresh deployment

$ErrorActionPreference = "Stop"

$RESOURCE_GROUP = "Careerate"
$CONTAINER_APP = "careerate-web"
$ACR_NAME = "careerateacr"
$IMAGE_NAME = "careerate-app"

Write-Host "🧹 STEP 1: Deactivating ALL old revisions..." -ForegroundColor Cyan

# Get all active revisions and deactivate them
$revisions = az containerapp revision list `
  --name $CONTAINER_APP `
  --resource-group $RESOURCE_GROUP `
  --query "[?properties.active==``true``].name" -o tsv

foreach ($revision in $revisions) {
    if ($revision) {
        Write-Host "  Deactivating: $revision" -ForegroundColor Yellow
        try {
            az containerapp revision deactivate `
              --name $CONTAINER_APP `
              --resource-group $RESOURCE_GROUP `
              --revision $revision
        } catch {
            Write-Host "  ⚠️  Failed to deactivate $revision" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🗑️  STEP 2: Deleting ALL images from Azure Container Registry..." -ForegroundColor Cyan

# Delete the entire repository (all tags)
try {
    az acr repository delete `
      --name $ACR_NAME `
      --repository $IMAGE_NAME `
      --yes
} catch {
    Write-Host "⚠️  No images to delete (this is fine)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⏳ STEP 3: Waiting 10 seconds for Azure to process deletions..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🔨 STEP 4: Triggering fresh Docker build..." -ForegroundColor Cyan

# Get current git commit
$GIT_SHA = git rev-parse HEAD
$TIMESTAMP = [int][double]::Parse((Get-Date -UFormat %s))

# Build and push with unique tag
az acr build `
  --registry $ACR_NAME `
  --image "${IMAGE_NAME}:${GIT_SHA}" `
  --image "${IMAGE_NAME}:latest" `
  --build-arg "CACHE_BUST=$TIMESTAMP" `
  --build-arg "GIT_COMMIT=$GIT_SHA" `
  --build-arg "DEPLOY_TIMESTAMP=$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')" `
  --no-cache `
  .

Write-Host ""
Write-Host "🚀 STEP 5: Deploying to Azure Container Apps with NEW revision..." -ForegroundColor Cyan

$revisionSuffix = "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

az containerapp update `
  --name $CONTAINER_APP `
  --resource-group $RESOURCE_GROUP `
  --image "${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${GIT_SHA}" `
  --revision-suffix $revisionSuffix `
  --set-env-vars "CACHE_BUST=$TIMESTAMP" "GIT_COMMIT=$GIT_SHA"

Write-Host ""
Write-Host "⏳ STEP 6: Waiting 30 seconds for deployment to stabilize..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "✅ STEP 7: Setting 100% traffic to latest revision..." -ForegroundColor Cyan

$LATEST_REVISION = az containerapp revision list `
  --name $CONTAINER_APP `
  --resource-group $RESOURCE_GROUP `
  --query "sort_by([?properties.active==``true``], &properties.createdTime)[-1].name" -o tsv

Write-Host "  Latest active revision: $LATEST_REVISION" -ForegroundColor Green

az containerapp ingress traffic set `
  --name $CONTAINER_APP `
  --resource-group $RESOURCE_GROUP `
  --revision-weight "$LATEST_REVISION=100"

Write-Host ""
Write-Host "🔍 STEP 8: Verification..." -ForegroundColor Cyan

$APP_URL = az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host "  App URL: https://$APP_URL" -ForegroundColor Green

# Test the deployment
try {
    $response = Invoke-WebRequest -Uri "https://$APP_URL" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Deployment successful! App is responding." -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  App returned error (may still be starting)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 CLEAN DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Visit: https://$APP_URL"
Write-Host "  2. Hard refresh (Ctrl+F5) to clear browser cache"
Write-Host "  3. Check browser console to verify the error is fixed"
Write-Host ""
Write-Host "🔧 If you still see the old code:" -ForegroundColor Yellow
Write-Host "  - Clear browser cache completely"
Write-Host "  - Try incognito mode"
Write-Host "  - Check deployed commit: curl https://$APP_URL/api/health | jq '.gitCommit'"
