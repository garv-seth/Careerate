# Wait for GitHub Actions deployment to complete and route traffic

$ErrorActionPreference = "Continue"

Write-Host "⏳ Waiting for GitHub Actions to complete build..." -ForegroundColor Cyan
Write-Host "   Check progress: https://github.com/garv-seth/CareerateV0/actions" -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 40  # 10 minutes max (40 * 15 seconds)
$attempt = 0
$imageFound = $false

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Attempt $attempt/$maxAttempts - Checking for new image..." -ForegroundColor Gray

    # Check if repository exists and has our commit tag
    $result = az acr repository show-tags --name careerateacr --repository careerate-app --top 5 2>&1

    if ($result -match "0690090") {
        Write-Host "✅ New image found with commit 0690090!" -ForegroundColor Green
        $imageFound = $true
        break
    } elseif ($result -notmatch "Error.*not found") {
        Write-Host "   Repository exists but commit 0690090 not found yet" -ForegroundColor Yellow
        Write-Host "   Latest tags: $result" -ForegroundColor Gray
    } else {
        Write-Host "   Repository not created yet (still building)" -ForegroundColor Yellow
    }

    Start-Sleep -Seconds 15
}

if (-not $imageFound) {
    Write-Host ""
    Write-Host "❌ Timeout waiting for build to complete" -ForegroundColor Red
    Write-Host "   Check GitHub Actions manually: https://github.com/garv-seth/CareerateV0/actions" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Deploying to Azure Container Apps..." -ForegroundColor Cyan

# Get the latest revision
$latestRevision = az containerapp revision list `
    --name careerate-web `
    --resource-group Careerate `
    --query "sort_by([?properties.active==``true``], &properties.createdTime)[-1].name" -o tsv

if ($latestRevision) {
    Write-Host "   Latest revision: $latestRevision" -ForegroundColor Green

    # Route 100% traffic to latest revision
    Write-Host "   Routing 100% traffic to latest revision..." -ForegroundColor Cyan
    az containerapp ingress traffic set `
        --name careerate-web `
        --resource-group Careerate `
        --revision-weight "$latestRevision=100"

    Write-Host "   ✅ Traffic routing updated!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No active revisions found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⏳ Waiting 30 seconds for deployment to stabilize..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "🔍 Verifying deployment..." -ForegroundColor Cyan

# Check deployed commit
$healthUrl = "https://careerate-web.politetree-6f564ad5.westus2.azurecontainerapps.io/api/health"
try {
    $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 10
    $deployedCommit = $health.gitCommit

    Write-Host "   Deployed commit: $deployedCommit" -ForegroundColor $(if ($deployedCommit -eq "0690090") { "Green" } else { "Red" })

    if ($deployedCommit -eq "0690090") {
        Write-Host ""
        Write-Host "🎉 SUCCESS! Hydration fix is now LIVE!" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Open in incognito: https://gocareerate.com/dashboard#agent"
        Write-Host "   2. Open DevTools Console (F12)"
        Write-Host "   3. Verify NO hydration errors appear"
        Write-Host ""
        Write-Host "   Old error: 'NotFoundError: Failed to execute removeChild on Node'"
        Write-Host "   Expected: Clean console, no errors!"
    } else {
        Write-Host ""
        Write-Host "⚠️  Deployed commit does not match. Expected: 0690090" -ForegroundColor Yellow
        Write-Host "   Give it another minute and check again."
    }
} catch {
    Write-Host "   ⚠️  Health check failed: $_" -ForegroundColor Yellow
    Write-Host "   App may still be starting up. Check manually in 1-2 minutes."
}

Write-Host ""
Write-Host "🌐 Production URL: https://gocareerate.com" -ForegroundColor Cyan
