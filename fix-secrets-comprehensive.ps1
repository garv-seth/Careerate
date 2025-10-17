# Comprehensive Secret Configuration Script
# This script will wire ALL secrets from Azure Key Vault to the Container App

$ErrorActionPreference = 'Continue'
$vault = "CareeerateSecretsVault"
$app = "careerate-web"
$rg = "Careerate"

Write-Host "Comprehensive Secret Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get all secrets from Key Vault
Write-Host "Fetching all secrets from Key Vault..." -ForegroundColor Yellow
$allSecrets = az keyvault secret list --vault-name $vault --query "[].name" -o tsv

$successCount = 0
$failCount = 0
$skippedCount = 0

# Critical secrets that MUST be set
$criticalSecrets = @(
    "DATABASE-URL",
    "OPENAI-API-KEY",
    "GITHUB-CLIENT-ID",
    "GITHUB-CLIENT-SECRET",
    "STRIPE-SECRET-KEY",
    "STRIPE-WEBHOOK-SECRET",
    "JWT-SECRET",
    "JWT-REFRESH-SECRET",
    "SESSION-SECRET",
    "ENCRYPTION-KEY",
    "AZURE-OPENAI-KEY",
    "AZURE-OPENAI-ENDPOINT",
    "ANTHROPIC-API-KEY"
)

Write-Host ""
Write-Host "Processing $($allSecrets.Count) secrets..." -ForegroundColor Cyan
Write-Host ""

foreach ($secret in $allSecrets) {
    $envName = $secret.ToUpper().Replace("-", "_")

    # Skip Docker Hub token (not an env var)
    if ($secret -eq "DOCKER-HUB-TOKEN") {
        Write-Host "SKIP: $secret (registry credential)" -ForegroundColor Gray
        $skippedCount++
        continue
    }

    $isCritical = $criticalSecrets -contains $secret
    $priority = if ($isCritical) { "[CRITICAL]" } else { "[INFO]" }

    try {
        Write-Host "$priority Setting $envName..." -NoNewline

        $result = az containerapp secret set `
            --name $app `
            --resource-group $rg `
            --secrets "${secret}=keyvaultref:https://${vault}.vault.azure.net/secrets/${secret},identityref:/subscriptions/46c583cc-1f11-4953-9502-d8d723fca7e9/resourceGroups/Careerate/providers/Microsoft.ManagedIdentity/userAssignedIdentities/careerateIdentity" `
            --output none 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " SUCCESS" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " FAILED" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "   Exception: $_" -ForegroundColor Red
        $failCount++
    }

    # Brief pause to avoid throttling
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Successfully configured: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "  Skipped: $skippedCount" -ForegroundColor Gray
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "Restarting container app to apply changes..." -ForegroundColor Yellow
    az containerapp revision restart --name $app --resource-group $rg --output none
    Write-Host "Container app restarted" -ForegroundColor Green
    Write-Host ""
    Write-Host "Waiting for app to be healthy (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    Write-Host "Configuration complete!" -ForegroundColor Green
} else {
    Write-Host "WARNING: No secrets were configured successfully" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verifying configuration..." -ForegroundColor Yellow
$configuredSecrets = az containerapp secret list --name $app --resource-group $rg --query "[].name" -o tsv
Write-Host "Total secrets in container app: $($configuredSecrets.Count)" -ForegroundColor Cyan
