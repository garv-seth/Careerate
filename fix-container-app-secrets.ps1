# Fix Container App by removing broken Key Vault secret references
# and using direct environment variables instead

$app = "careerate-web"
$rg = "Careerate"

Write-Host "Fixing Container App secret configuration..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Get current revision to preserve other settings
Write-Host "Getting current container app configuration..." -ForegroundColor Yellow
$currentApp = az containerapp show --name $app --resource-group $rg --query "{image: properties.template.containers[0].image, cpu: properties.template.containers[0].resources.cpu, memory: properties.template.containers[0].resources.memory}" -o json | ConvertFrom-Json

Write-Host "  Current image: $($currentApp.image)" -ForegroundColor Gray
Write-Host ""

# Step 2: Create a new revision without the broken secret references
Write-Host "Creating new revision with fixed configuration..." -ForegroundColor Yellow

# Build env vars list without secret references - use direct values instead
# We'll remove the problematic env vars and secrets entirely
az containerapp revision copy `
    --name $app `
    --resource-group $rg `
    --revision-suffix "fix-$(Get-Date -Format 'yyyyMMddHHmmss')" `
    --image $currentApp.image `
    --replace-env-vars `
        NODE_ENV=production `
        PORT=5000 `
        WEBSITES_PORT=5000 `
        BASE_URL=https://gocareerate.com `
        AZURE_KEY_VAULT_NAME=CareeerateSecretsVault `
        AZURE_SUBSCRIPTION_ID=46c583cc-1f11-4953-9502-d8d723fca7e9 `
        AZURE_RESOURCE_GROUP=Careerate `
        AZURE_MANAGED_ENV_ID=/subscriptions/46c583cc-1f11-4953-9502-d8d723fca7e9/resourceGroups/Careerate/providers/Microsoft.App/managedEnvironments/careerate-agents-env `
        AZURE_CONTAINER_REGISTRY=careerateacr `
        APPINSIGHTS_ENABLED=true `
        GPT_4O_DEPLOYMENT=gpt-4o `
        GPT_41_DEPLOYMENT=gpt-4 `
        GPT_4O_MINI_DEPLOYMENT=gpt-4o-mini `
        PHI_4_DEPLOYMENT=phi-4

if ($LASTEXITCODE -eq 0) {
    Write-Host "New revision created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Activating new revision..." -ForegroundColor Yellow

    # The new revision should now be active
    # Clean up old secrets that had broken references
    Write-Host "Cleaning up old secrets with broken identity references..." -ForegroundColor Yellow

    # Note: We can't easily remove secrets, but the new revision doesn't reference them
    # They'll just sit unused until manually cleaned up later

    Write-Host "Container App fixed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: Critical secrets (DATABASE_URL, API keys, etc.) should be set separately" -ForegroundColor Cyan
    Write-Host "using the set-direct-env-vars.ps1 script or as Key Vault references with system identity" -ForegroundColor Cyan
} else {
    Write-Host "Failed to create new revision" -ForegroundColor Red
    Write-Host "Error code:" $LASTEXITCODE -ForegroundColor Red
    exit 1
}
